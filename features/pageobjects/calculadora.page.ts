import { $ } from '@wdio/globals';

class CalculatorPage {
    variableNumero: any;

    // Localización de los botones de números con múltiples estrategias
    get btnNumero() {
        return (numeroDesejado: string) => this.getElementWithBackupSelectors([
            `~${numeroDesejado}`, // Usar ~ correctamente sin las plantillas de cadena
            `android=new UiSelector().description("${numeroDesejado}")`, // Usar descripción como backup
        ]);
    }

    // Localización del botón de suma con múltiples estrategias
    get btnMais() {
        return this.getElementWithBackupSelectors([
            '~máss',
            'android=new UiSelector().description("sumar")',
            'android=new UiSelector().resourceId("com.google.android.calculator:id/btn_plus")',
            '~más'
        ]);
    }

    // Localización del botón de igual con múltiples estrategias
    get btnIgual() {
        return this.getElementWithBackupSelectors([
            '~igual a',
            'android=new UiSelector().description("igual")',
            'android=new UiSelector().resourceId("com.google.android.calculator:id/btn_eq")',
        ]);
    }

    get lblResultadoFinal() {
        return $('android=new UiSelector().resourceId("com.google.android.calculator:id/result_final")');
    }

    // Método para hacer clic en los botones de número con lógica de retry y recuperación
    public async clicBtnNumero(numeroDesejado: string) {
        const btn = await this.btnNumero(numeroDesejado); // Obtén el botón específico para el número

        // Intentar encontrar y hacer clic en el botón con reintentos
        await this.retry(() => this.tryClickButton(btn));
    }

    public async clicBtnMais() {
        const btn = await this.btnMais; // Obtener el botón de suma

        await this.retry(() => this.tryClickButton(btn)); // Intentar hacer clic con reintentos
    }

    public async clicBtnIgual() {
        const btn = await this.btnIgual; // Obtener el botón de igual

        await this.retry(() => this.tryClickButton(btn)); // Intentar hacer clic con reintentos
    }

    public async pegarTextoDoCampoResultadoFinal() {
        return await this.lblResultadoFinal.getText();
    }

    // Función para obtener un elemento con múltiples estrategias de localización
    private async getElementWithBackupSelectors(selectors: string[]) {
        let lastError: Error | null = null;
        for (let selector of selectors) {
            try {
                const element = await $(selector); // Espera el elemento
                if (await element.isDisplayed()) {
                    return element;
                }
            } catch (error) {
                lastError = error; // Almacena el último error para reportarlo
            }
        }
        // Si ninguno de los selectores funciona, lanzar el último error encontrado
        if (lastError) throw lastError;
        throw new Error('No se pudo localizar el elemento con ninguno de los selectores.');
    }

    // Método para intentar hacer clic en el botón
    private async tryClickButton(btn) {
        try {
            // Espera hasta que el botón sea visible
            await btn.waitForDisplayed({ timeout: 5000 });
            await btn.click(); // Realiza el clic
        } catch (error) {
            // Si el botón no se encuentra, intentamos buscar un localizador alternativo
            console.log(`Fallo al encontrar el botón con el localizador inicial. Intentando con un alternativo.`);
            await this.retry(() => btn.waitForDisplayed({ timeout: 5000 }));
            await btn.click();
        }
    }

    // Función de reintentos con backoff exponencial
    private async retry(fn, retries = 3, delay = 1000) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === retries - 1) {
                    throw error;
                }
                const nextDelay = delay * Math.pow(2, attempt); // Backoff exponencial
                console.log(`Intento ${attempt + 1} fallido. Reintentando en ${nextDelay} ms...`);
                await new Promise(resolve => setTimeout(resolve, nextDelay)); // Espera con backoff
                attempt++;
            }
        }
    }
}

export default new CalculatorPage();
