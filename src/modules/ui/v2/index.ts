/**
 * Sidebar V2 - Diseño moderno inspirado en shadcn/ui
 *
 * Exporta todos los componentes necesarios para el nuevo diseño del sidebar
 */

// Context
export { SidebarProvider, useSidebar } from '../context/SidebarContext';
export type { } from '../context/SidebarContext';

// Components
export { default as SidebarV2 } from '../components/SidebarV2';
export { default as SidebarItemV2 } from '../components/SidebarItemV2';
export { default as AppLayoutV2 } from '../components/AppLayoutV2';

// Types
export type { SidebarItemV2Props, SidebarSubItem } from '../components/SidebarItemV2';

// Example/Demo
export { default as DemoPageV2 } from '../examples/DemoPageV2';
