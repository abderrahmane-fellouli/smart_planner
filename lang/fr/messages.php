<?php

/**
 * Centralized flash message translations.
 * Controllers use trans('messages.key') instead of hardcoded French strings.
 * This keeps every user-facing message translatable without duplicating logic.
 */
return [
    // Schedule generation
    'schedule_generated'       => 'Plannings générés avec succès !',
    'schedule_activated'       => 'Planning activé avec succès !',
    'schedule_deleted'         => 'Planning supprimé avec succès !',
    'schedule_not_found'       => 'Aucun planning trouvé. Veuillez d\'abord générer un planning.',
    'schedule_not_found_short' => 'Aucun planning trouvé.',

    // Rate limiting
    'rate_limited'             => 'Veuillez patienter :seconds secondes avant de régénérer.',

    // Free time
    'no_free_time'             => 'Pas assez de temps libre dans votre semaine. Réduisez vos cours fixes ou ajustez vos horaires.',

    // Fixed events
    'course_added'             => 'Cours ajouté !',
    'course_deleted'           => 'Cours supprimé !',
    'no_courses_first'         => 'Ajoutez des cours d\'abord !',
    'invalid_day'              => 'Jour invalide.',
    'overnight_not_supported'  => 'Les événements qui passent minuit ne sont pas encore pris en charge. Veuillez utiliser des horaires dans la même journée.',

    // Sessions
    'session_invalid'          => 'Session invalide.',
    'session_moved'            => 'Session déplacée avec succès !',
    'session_overlap_fixed'    => 'Ce créneau chevauche un cours fixe !',
    'session_overlap_study'    => 'Ce créneau chevauche une autre session d\'étude !',
    'session_outside_hours'    => 'Ce créneau est en dehors de vos heures habituelles (:start – :end).',

    // Preferences
    'preferences_saved_fr'     => 'Préférences enregistrées avec succès !',
    'preferences_saved_en'     => 'Preferences saved successfully !',
    'preferences_saved_ar'     => 'تم حفظ التفضيلات بنجاح !',

    // Search
    'search_rate_limited'      => 'Trop de requêtes de recherche. Veuillez patienter un instant.',

    // Sleep schedule
    'sleep_schedule_saved'     => 'Horaires de sommeil enregistrés.',

    // Preferences (generic)
    'preferences_saved'        => 'Préférences enregistrées.',
];
