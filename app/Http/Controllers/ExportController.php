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
            $coursHtml = '';
            $sessionsHtml = '';
            $total = '0';

            if ($jourData) {
                foreach (($jourData['cours_fixes'] ?? []) as $c) {
                    $title = e($c['title'] ?? '');
                    $teacher = e($c['teacher'] ?? '');
                    $start = e(substr($c['start_time'] ?? '', 0, 5));
                    $end   = e(substr($c['end_time']   ?? '', 0, 5));
                    $teacherPart = $teacher ? " · {$teacher}" : '';
                    $coursHtml .= "<span class='tag tag-cours'>📘 {$title}{$teacherPart} {$start}–{$end}</span>";
                }

                foreach (($jourData['sessions_etude'] ?? []) as $sess) {
                    $matiere = e($sess['matiere'] ?? '');
                    $start   = e(substr($sess['debut'] ?? '', 0, 5));
                    $end     = e(substr($sess['fin']   ?? '', 0, 5));
                    $sessionsHtml .= "<span class='tag tag-study'>{$start}–{$end} · {$matiere}</span>";
                }

                $total = e($jourData['total_heures_etude'] ?? 0);
            }

            $coursHtml    = $coursHtml ?: '<span class="empty-day">—</span>';
            $sessionsHtml = $sessionsHtml ?: '<span class="empty-day">—</span>';

            $rowsHtml .= "
            <tr>
                <td class='day-cell'>{$jour}</td>
                <td>{$coursHtml}</td>
                <td>{$sessionsHtml}</td>
                <td class='center total-cell'>{$total}h</td>
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
<html lang="{$lang}" dir="ltr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{$labels['app_name']} – {$typeLabel}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif; color:#1e293b; font-size:12.5px; line-height:1.5; background:#fff; }
  .page { max-width:760px; margin:0 auto; padding:28px 24px; }

  /* ── Header ── */
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; padding-bottom:18px; border-bottom:2.5px solid #e2e8f0; }
  .brand { display:flex; align-items:center; gap:12px; }
  .brand-icon { width:40px; height:40px; background:linear-gradient(135deg,#4F46E5,#6366F1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; box-shadow:0 2px 8px rgba(79,70,229,0.25); }
  .brand-name { font-size:22px; font-weight:800; color:#0f172a; letter-spacing:-0.03em; }
  .meta { text-align:right; font-size:11.5px; color:#64748b; line-height:1.6; }
  .meta strong { color:#0f172a; font-weight:600; }

  /* ── Type badge ── */
  .type-badge { display:inline-block; background:{$typeColor}; color:#fff; padding:5px 16px; border-radius:20px; font-size:11.5px; font-weight:700; letter-spacing:0.02em; box-shadow:0 1px 4px rgba(0,0,0,0.12); }

  /* ── Title ── */
  .section-title { font-size:17px; font-weight:700; color:#0f172a; margin:16px 0 14px; }

  /* ── Stats row ── */
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:22px; }
  .stat { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px 12px; text-align:center; }
  .stat-value { font-size:24px; font-weight:800; color:#0f172a; letter-spacing:-0.02em; }
  .stat-label { font-size:10.5px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; margin-top:2px; font-weight:600; }

  /* ── Schedule table ── */
  table { width:100%; border-collapse:collapse; margin-top:4px; }
  thead th { background:#f1f5f9; padding:10px 12px; text-align:left; font-size:10.5px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; border-bottom:2px solid #e2e8f0; }
  tbody td { padding:12px; vertical-align:top; border-bottom:1px solid #f1f5f9; }
  tbody tr:nth-child(even) { background:#fafbfc; }
  .day-cell { font-weight:700; color:#0f172a; white-space:nowrap; font-size:13px; width:100px; }
  .center { text-align:center; }
  .total-cell { font-weight:800; color:#0f172a; font-size:13px; }

  /* ── Tags ── */
  .tag { display:inline-block; padding:4px 10px; border-radius:6px; font-size:11px; margin:2px 3px 2px 0; font-weight:500; line-height:1.4; }
  .tag-cours { background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE; }
  .tag-study { background:#F0FDF4; color:#15803D; border:1px solid #BBF7D0; }
  .empty-day { color:#94a3b8; font-style:italic; font-size:11.5px; }

  /* ── Footer ── */
  .footer { margin-top:24px; padding-top:14px; border-top:1.5px solid #e2e8f0; display:flex; justify-content:space-between; font-size:10.5px; color:#94a3b8; }

  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; background:#fff; }
    .no-print { display:none !important; }
    .page { padding:0; }
    .stat { background:#f8fafc !important; }
    .tag-cours { background:#EEF2FF !important; }
    .tag-study { background:#F0FDF4 !important; }
    thead th { background:#f1f5f9 !important; }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Print button (hidden when printing) -->
  <div class="no-print" style="text-align:right;margin-bottom:14px;">
    <button onclick="window.print()" style="background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;border:none;padding:11px 28px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(79,70,229,0.3);transition:transform 0.1s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='none'">
      🖨️ {$labels['print_save']}
    </button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">⚡</div>
      <span class="brand-name">{$labels['app_name']}</span>
    </div>
    <div class="meta">
      <div><strong>{$userName}</strong></div>
      <div>{$userEmail}</div>
      <div>{$labels['generated_on']} {$genDate}</div>
    </div>
  </div>

  <!-- Schedule info -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
    <span class="type-badge">{$typeLabel}</span>
  </div>
  <h2 class="section-title">{$labels['weekly_schedule']}</h2>

  <!-- Stats -->
  <div class="stats">
    <div class="stat"><div class="stat-value">{$totalH}h</div><div class="stat-label">{$labels['total_week']}</div></div>
    <div class="stat"><div class="stat-value">{$sessions}</div><div class="stat-label">{$labels['study_sessions']}</div></div>
    <div class="stat"><div class="stat-value">{$moyenne}h</div><div class="stat-label">{$labels['avg_per_day']}</div></div>
  </div>

  <!-- Schedule table -->
  <table>
    <thead><tr><th>{$labels['day']}</th><th>{$labels['fixed_courses']}</th><th>{$labels['study_sessions']}</th><th style="text-align:center;">{$labels['study_total']}</th></tr></thead>
    <tbody>{$rowsHtml}</tbody>
  </table>

  <!-- Footer -->
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
