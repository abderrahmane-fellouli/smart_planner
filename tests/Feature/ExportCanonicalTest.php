<?php

use App\Models\User;
use App\Models\OptimizedSchedule;

// ── Export reads the canonical (active) schedule ──

test('csv export reflects the active schedule by default', function () {
    $user = User::factory()->create();

    OptimizedSchedule::create([
        'user_id' => $user->id,
        'type' => 'equilibre',
        'schedule' => [
            'details' => [
                'Lundi' => [
                    'cours_fixes' => [],
                    'sessions_etude' => [
                        ['debut' => '09:00', 'fin' => '10:00', 'duree' => 60, 'matiere' => 'MathsCanon'],
                        ['debut' => '10:00', 'fin' => '11:00', 'duree' => 60, 'matiere' => 'PhysiqueCanon'],
                    ],
                    'total_heures_etude' => 2,
                ],
            ],
            'resume' => ['total_heures_semaine' => 2, 'sessions_totales' => 2, 'moyenne_par_jour' => 0.3],
        ],
        'generated_for' => now(),
        'is_active' => true,
    ]);

    // An older, inactive schedule with totally different content.
    OptimizedSchedule::create([
        'user_id' => $user->id,
        'type' => 'leger',
        'schedule' => [
            'details' => [
                'Lundi' => [
                    'cours_fixes' => [],
                    'sessions_etude' => [
                        ['debut' => '99:00', 'fin' => '100:00', 'duree' => 60, 'matiere' => 'MatiereGhost'],
                    ],
                    'total_heures_etude' => 1,
                ],
            ],
            'resume' => ['total_heures_semaine' => 9, 'sessions_totales' => 1, 'moyenne_par_jour' => 1.0],
        ],
        'generated_for' => now()->subDay(),
        'is_active' => false,
    ]);

    $response = $this->actingAs($user)->get('/export/csv');
    $response->assertStatus(200);

    $csv = (string) $response->getContent();
    // Strip the UTF-8 BOM for plain-text matching.
    $csv = preg_replace('/^\xEF\xBB\xBF/', '', $csv);

    // The canonical active schedule content is present...
    $this->assertStringContainsString('MathsCanon', $csv);
    $this->assertStringContainsString('PhysiqueCanon', $csv);
    $this->assertStringContainsString('2h', $csv);

    // ...and the inactive one is NOT used as the default source.
    $this->assertStringNotContainsString('MatiereGhost', $csv);
    $this->assertStringNotContainsString('9h', $csv);
});

test('csv export honour explicit schedule_id over active', function () {
    $user = User::factory()->create();

    $active = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => [
            'details' => ['Lundi' => ['cours_fixes' => [], 'sessions_etude' => [
                ['debut' => '09:00', 'fin' => '10:00', 'duree' => 60, 'matiere' => 'ActiveMatiere'],
            ], 'total_heures_etude' => 1]],
            'resume' => ['total_heures_semaine' => 1, 'sessions_totales' => 1, 'moyenne_par_jour' => 0.2],
        ],
        'generated_for' => now(), 'is_active' => true,
    ]);

    $inactive = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'leger',
        'schedule' => [
            'details' => ['Lundi' => ['cours_fixes' => [], 'sessions_etude' => [
                ['debut' => '08:00', 'fin' => '09:00', 'duree' => 60, 'matiere' => 'PickedMatiere'],
            ], 'total_heures_etude' => 1]],
            'resume' => ['total_heures_semaine' => 1, 'sessions_totales' => 1, 'moyenne_par_jour' => 0.2],
        ],
        'generated_for' => now()->subDay(), 'is_active' => false,
    ]);

    $response = $this->actingAs($user)->get('/export/csv?schedule_id=' . $inactive->id);
    $response->assertStatus(200);
    $csv = preg_replace('/^\xEF\xBB\xBF/', '', (string) $response->getContent());

    $this->assertStringContainsString('PickedMatiere', $csv);
    $this->assertStringNotContainsString('ActiveMatiere', $csv);
});
