import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Ziggy } from './ziggy';
import { route as ziggyRoute } from 'ziggy-js';
import { ToastProvider } from './Components/Toast';
import { ThemeProvider } from './ThemeProvider';

window.route = (name, params, absolute = false) => ziggyRoute(name, params, absolute, Ziggy);

const appName = import.meta.env.VITE_APP_NAME || 'SmartPlanner';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ToastProvider>
                <ThemeProvider preferences={props.initialPage?.props?.preferences}>
                    <App {...props} />
                </ThemeProvider>
            </ToastProvider>
        );
    },
    progress: {
        color: '#4F46E5',
    },
});
