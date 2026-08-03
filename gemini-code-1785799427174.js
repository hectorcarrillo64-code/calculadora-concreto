const aguaTabla = {
    "2.5": { "9.5": 207, "12.5": 199, "19": 190, "25": 179 },
    "7.5": { "9.5": 228, "12.5": 216, "19": 205, "25": 193 },
    "15":  { "9.5": 243, "12.5": 228, "19": 216, "25": 202 }
};

const aireTabla = { "9.5": 3.0, "12.5": 2.5, "19": 2.0, "25": 1.5 };

function obtenerVolGrava(tmn, mf) {
    let baseVol = 0;
    if (tmn == "9.5") baseVol = 0.50 - ((mf - 2.4) / 0.2) * 0.02;
    if (tmn == "12.5") baseVol = 0.59 - ((mf - 2.4) / 0.2) * 0.02;
    if (tmn == "19") baseVol = 0.66 - ((mf - 2.4) / 0.2) * 0.02;
    if (tmn == "25") baseVol = 0.71 - ((mf - 2.4) / 0.2) * 0.02;
    return parseFloat(baseVol.toFixed(2));
}

function obtenerRelacionAC(fcr) {
    if(fcr >= 350) return 0.48 - ((fcr - 350) * (0.48 - 0.41) / (420 - 350));
    if(fcr >= 280) return 0.57 - ((fcr - 280) * (0.57 - 0.48) / (350 - 280));
    if(fcr >= 210) return 0.68 - ((fcr - 210) * (0.68 - 0.57) / (280 - 210));
    return 0.82; 
}

function calcularDosificacion() {
    let fc = parseFloat(document.getElementById('fc').value);
    let slump = document.getElementById('slump').value;
    let tmn = document.getElementById('tmn').value;
    
    let Gc = parseFloat(document.getElementById('denCem').value);
    let denGrava = parseFloat(document.getElementById('denGrava').value);
    let pvscGrava = parseFloat(document.getElementById('pvscGrava').value);
    let absGrava = parseFloat(document.getElementById('absGrava').value);
    let humGrava = parseFloat(document.getElementById('humGrava').value);
    
    let denArena = parseFloat(document.getElementById('denArena').value);
    let mfArena = parseFloat(document.getElementById('mfArena').value);
    let absArena = parseFloat(document.getElementById('absArena').value);
    let humArena = parseFloat(document.getElementById('humArena').value);

    let fcr = fc < 210 ? fc + 70 : (fc <= 350 ? fc + 85 : (1.10 * fc) + 50);
    let ac = obtenerRelacionAC(fcr);
    
    let agua = aguaTabla[slump][tmn];
    let aire = aireTabla[tmn];
    let cemento = agua / ac;

    let volGravaVarillado = obtenerVolGrava(tmn, mfArena);
    let pesoGrava = volGravaVarillado * pvscGrava;

    let volCem = cemento / (Gc * 1000);
    let volAgua = agua / 1000;
    let volGrava = pesoGrava / (denGrava * 1000);
    let volAire = aire / 100;
    
    let volArena = 1 - (volCem + volAgua + volGrava + volAire);
    let pesoArena = volArena * denArena * 1000;

    let Ga = (denGrava + denArena) / 2;
    let U = (10 * Ga * (100 - aire)) + (cemento * (1 - (Ga / Gc))) - (agua * (Ga - 1));
    let pesoArenaEstimado = U - (agua + cemento + pesoGrava);

    let aguaEnGrava = pesoGrava * ((humGrava - absGrava) / 100);
    let aguaEnArena = pesoArena * ((humArena - absArena) / 100);
    let aguaAjustada = agua - (aguaEnGrava + aguaEnArena);
    
    let gravaAjustada = pesoGrava * (1 + (humGrava / 100));
    let arenaAjustada = pesoArena * (1 + (humArena / 100));

    document.getElementById('resultados').style.display = 'block';
    document.getElementById('infoPasos').innerHTML = `
        <strong>F'cr Calculado:</strong> ${fcr.toFixed(2)} kg/cm² <br>
        <strong>Relación A/C:</strong> ${ac.toFixed(2)} <br>
        <strong>Agua de Diseño:</strong> ${agua} kg/m³ | <strong>Aire:</strong> ${aire}% <br>
        <strong>Volumen de Grava Varillado:</strong> ${volGravaVarillado} <br>
        <strong>Ajuste de Agua:</strong> ${aguaAjustada.toFixed(2)} kg (Restando humedad de agregados)
    `;

    document.getElementById('tablaAbsolutos').innerHTML = `
        <tr><th>Material</th><th>Peso Seco (kg)</th><th>Volumen (m³)</th><th>Peso Ajustado (kg)</th></tr>
        <tr><td>Cemento</td><td>${cemento.toFixed(2)}</td><td>${volCem.toFixed(4)}</td><td>${cemento.toFixed(2)}</td></tr>
        <tr><td>Agua</td><td>${agua.toFixed(2)}</td><td>${volAgua.toFixed(4)}</td><td>${aguaAjustada.toFixed(2)}</td></tr>
        <tr><td>Grava</td><td>${pesoGrava.toFixed(2)}</td><td>${volGrava.toFixed(4)}</td><td>${gravaAjustada.toFixed(2)}</td></tr>
        <tr><td>Arena</td><td>${pesoArena.toFixed(2)}</td><td>${volArena.toFixed(4)}</td><td>${arenaAjustada.toFixed(2)}</td></tr>
        <tr><td>Aire</td><td>-</td><td>${volAire.toFixed(4)}</td><td>-</td></tr>
    `;

    document.getElementById('tablaPeso').innerHTML = `
        <tr><th>Material</th><th>Peso Seco (kg)</th></tr>
        <tr><td>Cemento</td><td>${cemento.toFixed(2)}</td></tr>
        <tr><td>Agua</td><td>${agua.toFixed(2)}</td></tr>
        <tr><td>Grava</td><td>${pesoGrava.toFixed(2)}</td></tr>
        <tr><td>Arena</td><td>${pesoArenaEstimado.toFixed(2)}</td></tr>
        <tr><td><strong>Densidad Teórica (U)</strong></td><td><strong>${U.toFixed(2)} kg/m³</strong></td></tr>
    `;
}