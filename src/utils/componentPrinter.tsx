import { useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface PrintComponentProps {
    component?: React.ReactNode;
    pageSize?: string;
    margin?: string | number;
    padding?: string | number;
    copies?: number;
    pageOrientation?: "portrait" | "landscape";
}

const PrintComponent = ({ component, pageSize = "letter", margin = 0, padding = 0, copies = 1, pageOrientation = "portrait" }: PrintComponentProps) => {
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        pageStyle: `
            @page {
                size: ${pageOrientation} ${pageSize}; /* Establecer el tamaño de página, por ejemplo, A4 */
                margin: ${margin}; /* Establecer los márgenes */
                padding: ${padding};
            }
            @media print {
                html, body {
                    height: initial !important;
                    overflow: initial !important;
                    -webkit-print-color-adjust: exact;
                }
            }
        `,
    });
    const copy = useMemo(() => {
        const pages = []
        // copias del componente
        for (let i = 1; i <= copies; i++) {
            pages.push(component)
            // permite hacer saltos de pagina
            if (i < copies) pages.push(<div style={{ pageBreakBefore: "always" }}></div>)
        }
        return pages;
    }, [component, copies])

    return {
        print: () => {
            handlePrint()
        },
        //este debe ser renderizado en el componente padre para que funcione la impresion
        component: (
            <div style={{ display:"none" }}>
                <div ref={componentRef}>
                    {copy}
                </div>
            </div>
        )
    };
};

export default PrintComponent;