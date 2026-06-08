const DiscountService = require('../src/DiscountService');
describe('DiscountService', () => {
    let discountService;
    beforeEach(() => {
        discountService = new DiscountService();
    });

    describe('Validação de Entradas', () => {
        test('deve processar compra de R$ 0 sem lançar erro', () => {
            expect(discountService.calculate(0, 'REGULAR')).toBe(0);
        });
        test.each([
            [null],
            [undefined],
            ['100'],
            [isNaN]
        ])
            ('deve lançar erro para valor inválido: %p',
            (valorInvalido) => {
                expect(() =>
                    discountService.calculate(valorInvalido, 'VIP')
                ).toThrow('Valor da compra inválido');
            }
        );
    });

    describe('Cliente não cadastrado', () => {
        test('deve retornar 0 para cliente desconhecido', () => {
            const valor = 1000;
            const tipo = 'NOVO';
            const resultado = discountService.calculate(valor, tipo);
            expect(resultado).toBe(0);
        });


    });

    describe('Regras VIP e REGULAR', () => {
        test.each([
            ['VIP', 999.99, 99.999],
            ['VIP', 1000.00, 200.00],
            ['REGULAR', 499.99, 0],
            ['REGULAR', 500.00, 25.00]
        ])(
            'Perfil %s com valor %f deve retornar %f',
            (perfil, valor, descontoEsperado) => {
                const resultado =
                    discountService.calculate(valor, perfil);
                expect(resultado).toBeCloseTo(descontoEsperado);
            }
        );
    });
});


