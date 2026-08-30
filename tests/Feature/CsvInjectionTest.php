<?php

use App\Models\User;
use App\Models\OptimizedSchedule;

// ── CSV export injection guards: formula + line-break ──
// These exercise the live /export/csv endpoint with user-controlled
// subjects so they validate the real sanitization path end-to-end.

function csvExportWithSubject(object $testCase, string $matiere): string
{
    $user = User::factory()->create();

    OptimizedSchedule::create([
        'user_id' => $user->id,
        'type' => 'equilibre',
        'schedule' => [
            'details' => [
                'Lundi' => [
                    'cours_fixes' => [],
                    'sessions_etude' => [
                        ['debut' => '09:00', 'fin' => '10:00', 'duree' => 60, 'matiere' => $matiere],
                    ],
                    'total_heures_etude' => 1,
                ],
            ],
            'resume' => ['total_heures_semaine' => 1, 'sessions_totales' => 1, 'moyenne_par_jour' => 0.2],
        ],
        'generated_for' => now(),
        'is_active' => true,
    ]);

    $response = $testCase->actingAs($user)->get('/export/csv');

    $response->assertStatus(200);
    // Strip the UTF-8 BOM for plain-text matching.
    return preg_replace('/^\xEF\xBB\xBF/', '', (string) $response->getContent());
}

test('csv formula injection is still blocked with a leading quote', function () {
    foreach (['=SUM(A1:A9)', '+1+1', '-1', '@cmd', "\t=1"] as $payload) {
        $csv = csvExportWithSubject($this, $payload);
        // The payload must appear with a single-quote prefix somewhere in the details row.
        $this->assertStringContainsString("'" . $payload, $csv);
    }
});

test('csv embedded CRLF cannot create an unintended extra row', function () {
    // A subject containing a Windows newline. After sanitization it must NOT
    // introduce a brand-new CSV row in the details section.
    $payload = "LineOne\r\nLineTwo";
    $csv = csvExportWithSubject($this, $payload);

    // The raw CR must never appear in the exported details.
    $this->assertStringNotContainsString("\r", $csv);

    // The whole subject must appear on a single (details) line — i.e. the
    // sanitized, space-joined text should be present within one line.
    $sanitized = "LineOne LineTwo";
    $this->assertStringContainsString($sanitized, $csv);

    // Only the header + one course/study row should exist for that subject,
    // i.e. there must be exactly one details line containing the subject.
    $lines = preg_split('/\R/', trim($csv));
    $matches = array_filter($lines, fn ($l) => str_contains($l, $sanitized));
    expect(count($matches))->toBe(1);
});

test('csv embedded LF cannot create an unintended extra row', function () {
    $payload = "Alpha\nBeta";
    $csv = csvExportWithSubject($this, $payload);

    $this->assertStringNotContainsString("\nBeta", $csv);
    $this->assertStringContainsString("Alpha Beta", $csv);

    $lines = preg_split('/\R/', trim($csv));
    $matches = array_filter($lines, fn ($l) => str_contains($l, 'Alpha Beta'));
    expect(count($matches))->toBe(1);
});

test('normal single-line subject stays intact', function () {
    $csv = csvExportWithSubject($this, 'Mathematics 101');
    $this->assertStringContainsString('Mathematics 101', $csv);

    $lines = preg_split('/\R/', trim($csv));
    $matches = array_filter($lines, fn ($l) => str_contains($l, 'Mathematics 101'));
    expect(count($matches))->toBe(1);
});
