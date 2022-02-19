import React from 'react';

// adjust 2 elements to have the same width (maximum of the two)
// returns additional style to append to elements
function useWidthPair(elemL, elemR, innerL, innerR, showHud) {
    const [widthL, setWidthL] = React.useState(null);
    const [widthR, setWidthR] = React.useState(null);

    const width = e => {
        if (!e) return 0;

        const comp_style = getComputedStyle(e);
        const w = parseFloat(comp_style.width);
        return w;
    };

    // Width adjust part 1: reset elements's width to auto
    const widthAdjustPart1 = (setWidthL, setWidthR) => {
        setWidthL("auto");
        setWidthR("auto");
    };

    // Width adjust part 2: with width set to auto, parse width of elements to set both widths to max of the two
    const widthAdjustPart2 = (elemL, elemR, setWidthL, setWidthR) => {
        window.requestAnimationFrame(() => {
            const wL = width(elemL);
            const wR = width(elemR);
            const wMax = wL > wR ? wL : wR;
            setWidthL(wMax);
            setWidthR(wMax);
        });
    };

    React.useEffect(() => {
        widthAdjustPart1(setWidthL, setWidthR);
    }, [innerL, innerR, showHud]);
    React.useEffect(() => {
        if (widthL === "auto" && widthR === "auto") {
            widthAdjustPart2(elemL, elemR, setWidthL, setWidthR);
        }
    }, [widthL, widthR]);

    const adjust = w => {
        return w?.toString() === "NaN" ? "auto" : w;
    };

    return [
        { width: adjust(widthL) },
        { width: adjust(widthR) }
    ]
}

export default useWidthPair;
