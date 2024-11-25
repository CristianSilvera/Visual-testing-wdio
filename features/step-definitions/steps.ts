import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import calculadoraPage from '../pageobjects/calculadora.page';


Given('I open the calculator app', async () => {
    
    console.log('Starting calculator test');
    });

When('I enter {int}', async (number: number) => {
    await calculadoraPage.clicBtnNumero(number.toString());
    await expect (browser).toMatchScreenSnapshot('calulator-screen');
});

When('I press add', async () => {
    await calculadoraPage.clicBtnMais();
});

When('I press equal', async () => {
    await calculadoraPage.clicBtnIgual();
});

Then('the result should be {int}', async (expectedResult: number) => {
    const result = await calculadoraPage.pegarTextoDoCampoResultadoFinal();
    expect(parseInt(result)).toEqual(expectedResult);
});
