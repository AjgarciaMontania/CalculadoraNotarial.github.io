// Función para formatear números con puntos como separadores de miles
function formatNumberWithPoints(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}



// Función para eliminar los puntos y convertir a número
function parseNumberWithoutPoints(number) {
    return parseFloat(number.replace(/[^0-9]/g, ""));
}

 // Variable de estado para rastrear si se ha hecho clic en "Insertar"
 let isInserted = false;

 // Función para habilitar el botón "Calcular" después de hacer clic en "Insertar"
 document.getElementById('ingresarBtn').addEventListener('click', () => {
     isInserted = true;
     document.getElementById('calcularBtn').disabled = false;
 });

const CertificadoTradicion = 22100;
const ReproduccionDoc = 16000;

let num=0;
let ToTalCedla=0;
let totalCell=0;
let actoCell =0;
let valorActoCell=0;
let valorActo =0;
let totalValue=0;
let totalConsignar=0;

let suma = 0; // Suma de los valores en la columna "TOTAL"

// Función para formatear los campos de entrada en tiempo real
function formatInputFields() {
    const inputFields = document.querySelectorAll('.valor-acto');

    inputFields.forEach(input => {
        input.addEventListener('input', function () {
            // Eliminar los puntos existentes para evitar errores
            let rawValue = this.value.replace(/\./g, "");

            // Verificar si el valor es un número válido
            if (!isNaN(rawValue) && rawValue !== "") {
                // Formatear el número con puntos
                this.value = formatNumberWithPoints(rawValue);
            } else {
                // Si no es un número válido, limpiar el campo
                this.value = "";
            }
        });
    });
}

// Función para obtener el valor real sin puntos
function getRealValue(input) {
    return parseNumberWithoutPoints(input.value);
}

// Función para agregar una fila a la tabla
function addRow(acto) {
    const tableBody = document.getElementById('table-body');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${acto}</td>
        <td><input type="text" class="numero-escritura"></td>
        <td><input type="date" class="fecha-escritura"></td>
        <td><input type="text" class="valor-acto"></td>
        <td></td>
        <td></td>
        <td></td>
    `;
    tableBody.appendChild(row);

    // Formatear los nuevos campos de entrada
    formatInputFields();
}


// Constants for fee calculations
const FEE_CONSTANTS = Object.freeze({
    BASE_FEE: 48100,
    TIERS: [
        { limit: 11622077, rate: null },  // Special case using BASE_FEE
        { limit: 174328531, rate: 0.00825 },
        { limit: 302169519, rate: 0.01023 },
        { limit: 447443624, rate: 0.0114 },
        { limit: Infinity, rate: 0.01206 }
    ],
    ADDITIONAL_RATE: 1.02, // 2% additional fee
    HIPOTECA_TRIBUTARIA_RATE: 0.005,  // (1/2) * 0.01
    COMPRAVENTA_TRIBUTARIA_RATE: 0.01,
    CANCELACION_TRIBUTARIA: 173500
});

    function CALCULAR() {
        if (!isInserted) {
            // Mostrar mensaje de error si no se ha hecho clic en "Insertar"
            document.getElementById('errorMessage').style.display = 'block';
            return;
        }

        // Ocultar mensaje de error si ya se hizo clic en "Insertar"
        document.getElementById('errorMessage').style.display = 'none';


        let tributaria = 0;
        let notaryFee = 0;
        let Saber = 0;
        let Igac = 0;




    
        // Primero, eliminar filas de resumen existentes
        const tableBody = document.getElementById('table-body');
        const summaryRows = tableBody.querySelectorAll('tr[data-summary="true"], tr[data-additional="true"]');
        summaryRows.forEach(row => row.remove());
    
        const calculateNotaryFee = (valorActo) => {
            const tier = FEE_CONSTANTS.TIERS.find(t => valorActo <= t.limit);
            if (!tier.rate) {
                return FEE_CONSTANTS.BASE_FEE * FEE_CONSTANTS.ADDITIONAL_RATE;
            }
            return valorActo * tier.rate * FEE_CONSTANTS.ADDITIONAL_RATE;
        };
    
        const calculateRow = (row) => {
            const acto = row.children[0].textContent.trim();
            const valorActoInput = row.querySelector('.valor-acto');
            const valorActo = getRealValue(valorActoInput) || 0;
    
            if (valorActo <= 0) return;
    
            switch (acto) {
                case "HIPOTECA CON BANCO AGRARIO":
                    tributaria = Math.round(valorActo * FEE_CONSTANTS.HIPOTECA_TRIBUTARIA_RATE);
                    notaryFee = Math.round(calculateNotaryFee(valorActo) + CertificadoTradicion + ReproduccionDoc);
                    break;
                case "COMPRAVENTA":
                    tributaria = Math.round(valorActo * FEE_CONSTANTS.COMPRAVENTA_TRIBUTARIA_RATE);
                    notaryFee = Math.round(calculateNotaryFee(valorActo));
                    break;
                case "CERTIFICADO CANCELACIÓN HIPOTECA":
                    tributaria = FEE_CONSTANTS.CANCELACION_TRIBUTARIA;
                    notaryFee = Math.round(calculateNotaryFee(valorActo));
                    break;
                case "TRAMITE IGAC":
                    Igac = valorActo;
                    row.children[6].textContent = Igac.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    break;
                case "ESCRITURA PARA SABER":
                    Saber = valorActo;
                    row.children[6].textContent = Saber.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    break;
            }
    
            row.setAttribute('data-tributaria', tributaria);
            row.setAttribute('data-notary-fee', notaryFee);
            row.setAttribute('data-valor-Igac', Igac);
            row.setAttribute('data-valor-Saber', Saber);
            row.setAttribute('data-total', Math.round(tributaria + notaryFee));
    
            if (acto !== "TRAMITE IGAC" && acto !== "ESCRITURA PARA SABER") {
                row.children[4].textContent = tributaria.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
                row.children[5].textContent = notaryFee.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
                row.children[6].textContent = Math.round(tributaria + notaryFee).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
            }
        };
    
        try {
            const rows = document.querySelectorAll('#table-body tr');
            rows.forEach(calculateRow);
        } catch (error) {
            console.error('Error in CALCULAR:', error);
        }
    
        // Asegurar orden de ejecución
        setTimeout(() => {
            console.log("Ejecutando calcularTotales()");
            calcularTotales();
    
            console.log("Ejecutando generarCampos()");
            generarCampos();
        }, 0);
    }
    
    function calcularTotales() {
        // Initialize totals
        let totalSum = 0;
        let honorarios = 0;
        let contHonorarios = 0;
    
        // Cache DOM selections and constants
        const tableBody = document.getElementById('table-body');
        const rows = tableBody.querySelectorAll('tr');
        const HONORARIOS_RATES = {
            FIRST: 30000,
            SECOND_TO_THIRD: 20000,
            REMAINING: 15000
        };
    
        // Process each row
        rows.forEach(row => {
            const [actoCell, , , , , , totalCell] = row.children;
            const total = parseFloat(row.getAttribute('data-total')) || 0;
            const Igac = parseFloat(row.getAttribute('data-valor-Igac')) || 0;
            const Saber = parseFloat(row.getAttribute('data-valor-Saber')) || 0;
            const acto = row.children[0].textContent.trim();
            const valorActo = getRealValue(row.querySelector('.valor-acto')) || 0;
    
            // Calculate honorarios
            if (acto !== "TRAMITE IGAC" && valorActo > 0) {
                contHonorarios++;
                honorarios += contHonorarios === 1 ? HONORARIOS_RATES.FIRST :
                    contHonorarios <= 3 ? HONORARIOS_RATES.SECOND_TO_THIRD :
                        HONORARIOS_RATES.REMAINING;
            }
    
            // Sumar los valores de total solo si no es TRÁMITE IGAC ni ESCRITURA PARA SABER
            if (acto !== "TRAMITE IGAC" && acto !== "ESCRITURA PARA SABER") {
                totalSum += total;
            }
    
            // Sumar los valores de TRÁMITE IGAC y ESCRITURA PARA SABER
            if (acto === "TRAMITE IGAC" || acto === "ESCRITURA PARA SABER") {
                totalSum += valorActo;
            }
        });
    
        // Calculate additional fees
        const retiros = Math.round(Math.ceil((totalSum + honorarios) / 600000) * 3000);
         totalConsignar = totalSum + honorarios + retiros;
        
        // Create summary rows
        const summaryRows = [
            { label: 'SUBTOTAL', value: totalSum },
            { label: 'HONORARIOS', value: honorarios },
            { label: 'RETIROS', value: retiros },
            { label: 'TOTAL A CONSIGNAR', value: totalConsignar }
        ];
    
        // Add summary rows to table
        summaryRows.forEach(({ label, value }) => {
            const row = document.createElement('tr');
            row.setAttribute('data-summary', 'true');
            row.innerHTML = `
                <td colspan="5"></td>
                <td>${label}</td>
                <td>${value.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    useGrouping: true
                })}</td>
            `;
            tableBody.appendChild(row);
        });
    }



    
    function formatNumberWithDots(number) {
        return number.toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true
        });
    }
    
    document.getElementById('dineroEnviadoInput').addEventListener('input', function(event) {
        let value = event.target.value.replace(/[^\d.-]/g, '').replace(/\./g, '');
        while (/(\d)(?=(\d{3})+(?!\d))/g.test(value)) {
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }
        event.target.value = value;
    });
    
    // Función para generar los nuevos campos
    function generarCampos() {
        const tableBody = document.getElementById('table-body');
    
        // Buscar la fila de "TOTAL A CONSIGNAR"
        const totalConsignarRow = tableBody.querySelector('tr[data-label="TOTAL A CONSIGNAR"]');
    
    
        // Obtener el valor ingresado por el usuario en el campo 'DINERO ENVIADO' e insertarlo en la tabla
        const dineroEnviadoInput = document.getElementById('dineroEnviadoInput');
        const dineroEnviadoNumerico = parseFloat(dineroEnviadoInput.value.replace(/[^0-9]/g, "")) || 0;
        

    
        // Calcular SOBRANTE
        const sobrante = dineroEnviadoNumerico - totalConsignar;

    
        // Crear filas para "TOTAL GASTOS", "DINERO ENVIADO" y "SOBRANTE"
        const newRows = [
            { label: 'TOTAL GASTOS', value: totalConsignar },
            { label: 'DINERO ENVIADO', value: dineroEnviadoNumerico },
            { label: 'SOBRANTE', value: sobrante }
        ];
    
        // Agregar las nuevas filas a la tabla
        //tableBody.innerHTML = '';  // Limpiar antes de añadir las nuevas filas
        newRows.forEach(({ label, value }) => {
            const row = document.createElement('tr');
            row.setAttribute('data-additional', 'true');
            row.innerHTML = `
                <td colspan="5"></td>
                <td><b>${label}</b></td>
                <td>${value.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    useGrouping: true
                })}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    

//console.log("Valor de suma:", suma);
// Función para limpiar la tabla
function Limpiar() {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ""; // Limpiar todas las filas

    const inputFields = document.querySelectorAll('.input-cantidad');
    
    inputFields.forEach(input => {
        input.value = ""; // Restablecer el valor de cada campo a vacío
    });
}

// Función para ingresar datos
function INGRESAR() {
    const compraventa = parseInt(document.getElementById('compraventa').value) || 0;
    const certificado = parseInt(document.getElementById('certificado').value) || 0;
    const hipoteca = parseInt(document.getElementById('hipoteca').value) || 0;
    const saber = parseInt(document.getElementById('saber').value) || 0;
    const igac = parseInt(document.getElementById('igac').value) || 0;

    // Agregar filas según las cantidades ingresadas
    for (let i = 0; i < compraventa; i++) {
        addRow("COMPRAVENTA");
    }
    for (let i = 0; i < certificado; i++) {
        addRow("CERTIFICADO CANCELACIÓN HIPOTECA");
    }
    for (let i = 0; i < hipoteca; i++) {
        addRow("HIPOTECA CON BANCO AGRARIO");
    }
    for (let i = 0; i < saber; i++) {
        addRow("ESCRITURA PARA SABER");
    }
    for (let i = 0; i < igac; i++) {
        addRow("TRAMITE IGAC");
    }
}
