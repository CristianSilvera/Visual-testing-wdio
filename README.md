# Self-Healing en Automatización de Pruebas

Este documento describe la implementación de estrategias de **Self-Healing** en pruebas automatizadas utilizando WebDriverIO y Appium. Estas estrategias mejoran la robustez de las pruebas al manejar de manera inteligente problemas como localización de elementos, sincronización y fallos temporales.

---

## 1. Múltiples Estrategias de Localización

El método `getElementWithBackupSelectors` intenta localizar un elemento utilizando una lista de selectores alternativos. Si un selector falla, el método intenta con el siguiente en la lista. Esto permite que la prueba continúe incluso si el primer selector no es válido.

### Implementación

```typescript
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
```

---

## 2. Reintentos Automáticos

La función `retry` implementa una lógica de reintento con **backoff exponencial**. Si un intento falla, espera un tiempo antes de reintentar, aumentando el tiempo de espera con cada intento fallido. Esto es útil para manejar problemas de sincronización o carga.

### Implementación

```typescript
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
```

---

## 3. Manejo de Excepciones

El método `tryClickButton` intenta hacer clic en un botón y maneja excepciones. Si el primer intento falla, utiliza un localizador alternativo. Esto permite continuar con la prueba sin interrumpir el flujo.

### Implementación

```typescript
private async tryClickButton(btn) {
    try {
        // Espera hasta que el botón sea visible
        await btn.waitForDisplayed({ timeout: 5000 });
        await btn.click(); // Realiza el clic
    } catch (error) {
        console.log(`Fallo al encontrar el botón con el localizador inicial. Intentando con un alternativo.`);
        await this.retry(() => btn.waitForDisplayed({ timeout: 5000 }));
        await btn.click();
    }
}
```

---

## 4. Uso de Múltiples Estrategias en los Botones

Los botones como `btnNumero`, `btnMais` y `btnIgual` utilizan múltiples estrategias de localización, lo que aumenta la probabilidad de éxito en la interacción con ellos.

### Implementación

```typescript
get btnNumero() {
    return (numeroDesejado: string) => this.getElementWithBackupSelectors([
        `~${numeroDesejado}`, // Localización preferida
        `android=new UiSelector().description("${numeroDesejado}")`, // Alternativa basada en descripción
    ]);
}

get btnMais() {
    return this.getElementWithBackupSelectors([
        '~máss',
        'android=new UiSelector().description("sumar")',
        'android=new UiSelector().resourceId("com.google.android.calculator:id/btn_plus")',
        '~más'
    ]);
}

get btnIgual() {
    return this.getElementWithBackupSelectors([
        '~igual a',
        'android=new UiSelector().description("igual")',
        'android=new UiSelector().resourceId("com.google.android.calculator:id/btn_eq")',
    ]);
}
```

---

## Conclusión

El código implementa **Self-Healing** de manera efectiva mediante:

- **Múltiples estrategias de localización**: Permiten adaptarse a cambios en los identificadores de los elementos.
- **Reintentos automáticos con backoff exponencial**: Mejora la resiliencia frente a fallos temporales.
- **Manejo avanzado de excepciones**: Garantiza la continuidad de las pruebas.

Estas técnicas hacen que la automatización sea más robusta y capaz de adaptarse a fallos comunes en aplicaciones dinámicas.