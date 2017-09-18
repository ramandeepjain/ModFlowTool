import numericallyIntegrate from './numericallyIntegrate';
import erf from './erf';

export function calculateDiagramData(variable, w, L, W, hi, Sy, K, t, xMin, xMax, dX) {
    const a = W / 2;
    const l = L / 2;
    const v = K * hi / Sy;
    const sqrt4vt = Math.sqrt(4 * v * t);

    // eq 2
    function S(alpha, beta) {
        return numericallyIntegrate(0, 1, 0.001, function(tau) {
            if (tau !== 0) {
                const sqrtTau = Math.sqrt(tau);
                return erf(alpha / sqrtTau) * erf(beta / sqrtTau);
            }
            return 0;
        });
    }

    // code for eq 1 with y = 0
    function calcHhi(x, y) {
        const s1 = S((l + x) / sqrt4vt, (a + y) / sqrt4vt),
            s2 = S((l + x) / sqrt4vt, (a - y) / sqrt4vt),
            s3 = S((l - x) / sqrt4vt, (a + y) / sqrt4vt),
            s4 = S((l - x) / sqrt4vt, (a - y) / sqrt4vt);
        return Math.sqrt(w / 2 / K * v * t * (s1 + s2 + s3 + s4) + hi * hi).toFixed(5) - hi.toFixed(5); // eq 1
    }

    const data = [];
    if (variable === 'x') {
        for (let x = xMin; x < xMax; x += dX) {
            data.push({
                x,
                hhi: calcHhi(x, 0)
            });
        }
    } else {
        for (let y = xMin; y < xMax; y += dX) {
            data.push({
                y,
                hhi: calcHhi(0, y)
            });
        }
    }

    return data;
}

export function calculateXmax(variable, w, L, W, hi, Sy, K, t) {
    const a = W / 2,
        l = L / 2,
        v = K * hi / Sy,
        sqrt4vt = Math.sqrt(4 * v * t);

    // eq 2
    function S(alpha, beta) {
        return numericallyIntegrate(0, 1, 0.001, function(tau) {
            if (tau != 0) {
                const sqrttau = Math.sqrt(tau);
                return erf(alpha / sqrttau) * erf(beta / sqrttau);
            }
            return 0;
        });
    }

    // code for eq 1 with y = 0
    function calcHhi(x, y) {
        const s1 = S((l + x) / sqrt4vt, (a + y) / sqrt4vt),
            s2 = S((l + x) / sqrt4vt, (a - y) / sqrt4vt),
            s3 = S((l - x) / sqrt4vt, (a + y) / sqrt4vt),
            s4 = S((l - x) / sqrt4vt, (a - y) / sqrt4vt);
        return Math.sqrt(w / 2 / K * v * t * (s1 + s2 + s3 + s4) + hi * hi).toFixed(5) - hi.toFixed(5); // eq 1
    }
    var x_max = 100;
    if (variable == "x") {
        while (calcHhi(x_max,0) > 0.01) {
            x_max = x_max +50;
        }
    } else {
        while (calcHhi(0,x_max) > 0.01){
            x_max = x_max +50;
        }

    }
    return x_max;
}