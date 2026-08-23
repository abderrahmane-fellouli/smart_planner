<?php

namespace App\Http\Controllers;

use App\Models\OptimizedSchedule;
use App\Models\FixedEvent;
use App\Models\Preference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExportController extends Controller
{
    /**
     * Display the export page with schedule selection options.
     * Only shows the current user's schedules — enforced by user_id scoping.
     */
    public function index()
    {
        $user = auth()->user();

        $activeSchedule = OptimizedSchedule::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        $allSchedules = OptimizedSchedule::where('user_id', $user->id)
            ->orderBy('generated_for', 'desc')
            ->get();

        $fixedEvents = FixedEvent::where('user_id', $user->id)->get();
        $preferences = Preference::where('user_id', $user->id)->first();

        return Inertia::render('Export/Index', [
            'activeSchedule' => $activeSchedule,
            'allSchedules'   => $allSchedules,
            'fixedEvents'    => $fixedEvents,
            'preferences'    => $preferences,
            'user'           => $user,
        ]);
    }

    /**
     * Generate a printable HTML "PDF" view of a schedule.
     * Accepts a `lang` query parameter (fr/en/ar) for translated labels.
     */
    public function exportPdf(Request $request)
    {
        $user = auth()->user();
        $lang = in_array($request->input('lang'), ['fr', 'en', 'ar']) ? $request->input('lang') : 'fr';

        $scheduleId = $request->input('schedule_id');

        if ($scheduleId) {
            $schedule = OptimizedSchedule::where('id', $scheduleId)
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $schedule = OptimizedSchedule::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();
        }

        if (!$schedule) {
            return redirect()->back()->with('error', trans('messages.schedule_not_found'));
        }

        $fixedEvents = FixedEvent::where('user_id', $user->id)->get();

        $html = $this->generatePdfHtml($schedule, $fixedEvents, $user, $lang);

        return response($html, 200)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    /**
     * Export a schedule as CSV (BOM-encoded for Excel compatibility).
     * Accepts a `lang` query parameter (fr/en/ar) for translated labels.
     */
    public function exportCsv(Request $request)
    {
        $user = auth()->user();
        $lang = in_array($request->input('lang'), ['fr', 'en', 'ar']) ? $request->input('lang') : 'fr';

        $scheduleId = $request->input('schedule_id');

        if ($scheduleId) {
            $schedule = OptimizedSchedule::where('id', $scheduleId)
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $schedule = OptimizedSchedule::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();
        }

        if (!$schedule) {
            return redirect()->back()->with('error', trans('messages.schedule_not_found_short'));
        }

        $csv = $this->generateCsv($schedule, $user, $lang);

        $filename = 'planning_' . $schedule->type . '_' . now()->format('Y-m-d') . '.csv';

        return response($csv, 200)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    // ─────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────

    /**
     * Build the printable HTML page for a schedule.
     *
     * XSS Prevention: Every value that comes from user input ($userName,
     * $userEmail, course titles, subject names) is passed through e() (htmlspecialchars)
     * before being embedded in the HTML. This prevents script injection via
     * malicious form inputs.
     */
    private function generatePdfHtml($schedule, $fixedEvents, $user, $lang = 'fr')
    {
        $details = $schedule->schedule['details'] ?? [];
        $resume  = $schedule->schedule['resume']  ?? [];
        $jours   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

        $labels = $this->getExportLabels($lang);

        $typeLabels = [
            'intensif'  => ['label'=>$labels['type_intensif'],  'color'=>'#EF4444'],
            'equilibre' => ['label'=>$labels['type_equilibre'],'color'=>'#10B981'],
            'leger'     => ['label'=>$labels['type_leger'],    'color'=>'#3B82F6'],
        ];
        $cfg = $typeLabels[$schedule->type] ?? $typeLabels['equilibre'];

        $rowsHtml = '';
        foreach ($jours as $jour) {
            $jourData = $details[$jour] ?? null;
            if (!$jourData) continue;

            $coursHtml = '';
            foreach (($jourData['cours_fixes'] ?? []) as $c) {
                $title = e($c['title'] ?? '');
                $start = e(substr($c['start_time'] ?? '', 0, 5));
                $end   = e(substr($c['end_time']   ?? '', 0, 5));
                $coursHtml .= "<span class='tag tag-cours'>📘 {$title} {$start}–{$end}</span>";
            }

            $sessionsHtml = '';
            foreach (($jourData['sessions_etude'] ?? []) as $sess) {
                $matiere = e($sess['matiere'] ?? '');
                $start   = e(substr($sess['debut'] ?? '', 0, 5));
                $end     = e(substr($sess['fin']   ?? '', 0, 5));
                $sessionsHtml .= "<span class='tag tag-study'>{$start}–{$end} · {$matiere}</span>";
            }

            $total = e($jourData['total_heures_etude'] ?? 0);

            $rowsHtml .= "
            <tr>
                <td class='day-cell'>{$jour}</td>
                <td>{$coursHtml}</td>
                <td>{$sessionsHtml}</td>
                <td class='center'><strong>{$total}h</strong></td>
            </tr>";
        }

        $totalH    = e($resume['total_heures_semaine'] ?? 0);
        $sessions  = e($resume['sessions_totales']     ?? 0);
        $moyenne   = e($resume['moyenne_par_jour']     ?? 0);
        $typeLabel = e($cfg['label']);
        $typeColor = $cfg['color'];
        $genDate   = e(now()->format('d/m/Y H:i'));
        $userName  = e($user->name);
        $userEmail = e($user->email);

        return <<<HTML
<!DOCTYPE html>
<html lang="{$lang}">
<head>
<meta charset="UTF-8"/>
<title>{$labels['app_name']} – {$typeLabel}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#111827; font-size:13px; }
  .page { max-width:900px; margin:0 auto; padding:32px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:2px solid #F3F4F6; }
  .logo { display:flex; align-items:center; gap:10px; }
  .logo-icon { width:36px; height:36px; background:#4F46E5; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; }
  .logo-text { font-size:20px; font-weight:800; color:#111827; letter-spacing:-0.02em; }
  .meta { text-align:right; font-size:12px; color:#6B7280; }
  .meta strong { color:#111827; }
  .type-badge { display:inline-block; background:{$typeColor}; color:#fff; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; margin-bottom:16px; }
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
  .stat { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; padding:14px 16px; text-align:center; }
  .stat-value { font-size:22px; font-weight:800; color:#111827; }
  .stat-label { font-size:11px; color:#9CA3AF; margin-top:2px; }
  table { width:100%; border-collapse:collapse; }
  thead th { background:#F9FAFB; padding:10px 12px; text-align:left; font-size:11px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em; border-bottom:2px solid #E5E7EB; }
  tbody tr { border-bottom:1px solid #F3F4F6; }
  tbody tr:hover { background:#FAFAFA; }
  td { padding:10px 12px; vertical-align:top; }
  .day-cell { font-weight:700; color:#111827; white-space:nowrap; }
  .center { text-align:center; }
  .tag { display:inline-block; padding:3px 8px; border-radius:6px; font-size:11px; margin:2px 2px 2px 0; }
  .tag-cours { background:#EEF2FF; color:#4338CA; }
  .tag-study { background:#F0FDF4; color:#15803D; }
  .footer { margin-top:28px; padding-top:16px; border-top:1px solid #F3F4F6; display:flex; justify-content:space-between; font-size:11px; color:#9CA3AF; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } .no-print { display:none; } .page { padding:16px; } }
</style>
</head>
<body>
<div class="page">
  <div class="no-print" style="text-align:right;margin-bottom:16px;">
    <button onclick="window.print()" style="background:#4F46E5;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
      {$labels['print_save']}
    </button>
  </div>
  <div class="header">
    <div class="logo">
      <div class="logo-icon">⚡</div>
      <span class="logo-text">{$labels['app_name']}</span>
    </div>
    <div class="meta">
      <div><strong>{$userName}</strong></div>
      <div>{$userEmail}</div>
      <div>{$labels['generated_on']} {$genDate}</div>
    </div>
  </div>
  <span class="type-badge">{$labels['schedule']} {$typeLabel}</span>
  <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:16px;">{$labels['weekly_schedule']}</h2>
  <div class="stats">
    <div class="stat"><div class="stat-value">{$totalH}h</div><div class="stat-label">{$labels['total_week']}</div></div>
    <div class="stat"><div class="stat-value">{$sessions}</div><div class="stat-label">{$labels['study_sessions']}</div></div>
    <div class="stat"><div class="stat-value">{$moyenne}h</div><div class="stat-label">{$labels['avg_per_day']}</div></div>
  </div>
  <table>
    <thead><tr><th>{$labels['day']}</th><th>{$labels['fixed_courses']}</th><th>{$labels['study_sessions']}</th><th>{$labels['study_total']}</th></tr></thead>
    <tbody>{$rowsHtml}</tbody>
  </table>
  <div class="footer">
    <span>{$labels['app_name']} – {$labels['tagline']}</span>
    <span>{$labels['exported_on']} {$genDate}</span>
  </div>
</div>
</body>
</html>
HTML;
    }

    /**
     * Generate a CSV string from schedule data.
     * Uses BOM (Byte Order Mark) prefix so Excel detects UTF-8 encoding.
     * Commas in titles are replaced with semicolons to preserve CSV structure.
     * Cells are sanitized against CSV injection (formula injection) by prefixing
     * formula-triggering characters with a single quote.
     */
    private function generateCsv($schedule, $user, $lang = 'fr')
    {
        $details = $schedule->schedule['details'] ?? [];
        $resume  = $schedule->schedule['resume']  ?? [];
        $jours   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

        $labels = $this->getExportLabels($lang);

        // BOM UTF-8 for Excel compatibility
        $csv = "\xEF\xBB\xBF";

        $csv .= $labels['app_name'] . " – " . $labels['export_schedule'] . "\n";
        $csv .= $labels['csv_student'] . ":,{$this->sanitizeCsvCell($user->name)}\n";
        $csv .= $labels['csv_email'] . ":,{$this->sanitizeCsvCell($user->email)}\n";
        $csv .= $labels['csv_type'] . ":,{$schedule->type}\n";
        $csv .= $labels['csv_export_date'] . ":," . now()->format('d/m/Y H:i') . "\n\n";

        $csv .= $labels['csv_summary'] . "\n";
        $csv .= $labels['csv_total_hours'] . ":,{$resume['total_heures_semaine']}h\n";
        $csv .= $labels['csv_total_sessions'] . ":,{$resume['sessions_totales']}\n";
        $csv .= $labels['csv_avg_per_day'] . ":,{$resume['moyenne_par_jour']}h\n\n";

        $csv .= $labels['csv_detail'] . "\n";
        $csv .= $labels['csv_day'] . "," . $labels['csv_type'] . "," . $labels['csv_title'] . "," . $labels['csv_start'] . "," . $labels['csv_end'] . "," . $labels['csv_duration'] . "\n";

        foreach ($jours as $jour) {
            $jourData = $details[$jour] ?? null;
            if (!$jourData) continue;

            foreach (($jourData['cours_fixes'] ?? []) as $c) {
                $title = str_replace(',', ';', $this->sanitizeCsvCell($c['title'] ?? ''));
                $start = substr($c['start_time'] ?? '', 0, 5);
                $end   = substr($c['end_time']   ?? '', 0, 5);
                $csv  .= "{$jour},{$labels['csv_fixed_course']},{$title},{$start},{$end},\n";
            }

            foreach (($jourData['sessions_etude'] ?? []) as $sess) {
                $matiere = str_replace(',', ';', $this->sanitizeCsvCell($sess['matiere'] ?? ''));
                $start   = substr($sess['debut'] ?? '', 0, 5);
                $end     = substr($sess['fin']   ?? '', 0, 5);
                $duree   = ($sess['duree'] ?? 0) . ' min';
                $csv    .= "{$jour},{$labels['csv_study_session']},{$matiere},{$start},{$end},{$duree}\n";
            }
        }

        return $csv;
    }

    /**
     * Return translated label strings for the given language.
     */
    private function getExportLabels(string $lang): array
    {
        $labels = [
            'fr' => [
                'app_name'         => 'SmartPlanner',
                'print_save'       => 'Imprimer / Sauvegarder PDF',
                'generated_on'     => 'Généré le',
                'schedule'         => 'Planning',
                'weekly_schedule'  => 'Planning hebdomadaire',
                'total_week'       => 'Total / semaine',
                'study_sessions'   => 'Sessions d\'étude',
                'avg_per_day'      => 'Moyenne / jour',
                'day'              => 'Jour',
                'fixed_courses'    => 'Cours fixes',
                'study_total'      => 'Total étude',
                'tagline'          => 'Planning d\'étude intelligent',
                'exported_on'      => 'Exporté le',
                'type_intensif'    => 'Intensif',
                'type_equilibre'   => 'Équilibré',
                'type_leger'       => 'Léger',
                'export_schedule'  => 'Export Planning',
                'csv_student'      => 'Étudiant',
                'csv_email'        => 'Email',
                'csv_type'         => 'Type',
                'csv_export_date'  => 'Date export',
                'csv_summary'      => 'RÉSUMÉ',
                'csv_total_hours'  => 'Total heures / semaine',
                'csv_total_sessions' => 'Sessions totales',
                'csv_avg_per_day'  => 'Moyenne par jour',
                'csv_detail'       => 'DÉTAIL PAR JOUR',
                'csv_day'          => 'Jour',
                'csv_title'        => 'Titre',
                'csv_start'        => 'Début',
                'csv_end'          => 'Fin',
                'csv_duration'     => 'Durée',
                'csv_fixed_course' => 'Cours fixe',
                'csv_study_session' => 'Session étude',
            ],
            'en' => [
                'app_name'         => 'SmartPlanner',
                'print_save'       => 'Print / Save PDF',
                'generated_on'     => 'Generated on',
                'schedule'         => 'Schedule',
                'weekly_schedule'  => 'Weekly Schedule',
                'total_week'       => 'Total / week',
                'study_sessions'   => 'Study sessions',
                'avg_per_day'      => 'Average / day',
                'day'              => 'Day',
                'fixed_courses'    => 'Fixed courses',
                'study_total'      => 'Study total',
                'tagline'          => 'Smart study planner',
                'exported_on'      => 'Exported on',
                'type_intensif'    => 'Intensive',
                'type_equilibre'   => 'Balanced',
                'type_leger'       => 'Light',
                'export_schedule'  => 'Export Schedule',
                'csv_student'      => 'Student',
                'csv_email'        => 'Email',
                'csv_type'         => 'Type',
                'csv_export_date'  => 'Export date',
                'csv_summary'      => 'SUMMARY',
                'csv_total_hours'  => 'Total hours / week',
                'csv_total_sessions' => 'Total sessions',
                'csv_avg_per_day'  => 'Average per day',
                'csv_detail'       => 'DETAIL BY DAY',
                'csv_day'          => 'Day',
                'csv_title'        => 'Title',
                'csv_start'        => 'Start',
                'csv_end'          => 'End',
                'csv_duration'     => 'Duration',
                'csv_fixed_course' => 'Fixed course',
                'csv_study_session' => 'Study session',
            ],
            'ar' => [
                'app_name'         => 'المساعد الذكي',
                'print_save'       => 'طباعة / حفظ PDF',
                'generated_on'     => 'تم الإنشاء في',
                'schedule'         => 'الجدول',
                'weekly_schedule'  => 'الجدول الأسبوعي',
                'total_week'       => 'المجموع / أسبوع',
                'study_sessions'   => 'جلسات الدراسة',
                'avg_per_day'      => 'المتوسط / يوم',
                'day'              => 'اليوم',
                'fixed_courses'    => 'المواد الثابتة',
                'study_total'      => 'إجمالي الدراسة',
                'tagline'          => 'مخطط الدراسة الذكي',
                'exported_on'      => 'تم التصدير في',
                'type_intensif'    => 'مكثف',
                'type_equilibre'   => 'متوازن',
                'type_leger'       => 'خفيف',
                'export_schedule'  => 'تصدير الجدول',
                'csv_student'      => 'الطالب',
                'csv_email'        => 'البريد الإلكتروني',
                'csv_type'         => 'النوع',
                'csv_export_date'  => 'تاريخ التصدير',
                'csv_summary'      => 'الملخص',
                'csv_total_hours'  => 'إجمالي الساعات / أسبوع',
                'csv_total_sessions' => 'إجمالي الجلسات',
                'csv_avg_per_day'  => 'المتوسط اليومي',
                'csv_detail'       => 'التفصيل حسب اليوم',
                'csv_day'          => 'اليوم',
                'csv_title'        => 'العنوان',
                'csv_start'        => 'البداية',
                'csv_end'          => 'النهاية',
                'csv_duration'     => 'المدة',
                'csv_fixed_course' => 'مادة ثابتة',
                'csv_study_session' => 'جلسة دراسة',
            ],
        ];

        return $labels[$lang] ?? $labels['fr'];
    }

    /**
     * Sanitize a cell value to prevent CSV injection (formula injection).
     * Cells starting with =, +, -, @, or tab are prefixed with a single quote
     * so Excel treats them as text, not as formulas.
     */
    private function sanitizeCsvCell(string $value): string
    {
        $firstChar = substr($value, 0, 1);
        if (in_array($firstChar, ['=', '+', '-', '@', "\t"])) {
            return "'" . $value;
        }
        return $value;
    }
}
