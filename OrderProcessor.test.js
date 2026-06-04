const OrderProcessor = require('../src/OrderProcessor');
describe('OrderProcessor', () => {
    let paymentGateway;
    let emailService;
    let orderProcessor;
    beforeEach(() => {
        jest.clearAllMocks();
        paymentGateway = {
            charge: jest.fn()
        };
        emailService = {
            sendReceipt: jest.fn(),
            sendFailureNotification: jest.fn()
        };
        orderProcessor = new OrderProcessor(
            paymentGateway,
            emailService
        );
    });

    describe('Validação de Entrada', () => {
        test('deve rejeitar usuário nulo', async () => {
            await expect(
                orderProcessor.processOrder(null, 100)
            ).rejects.toThrow('Usuário inválido');
            expect(paymentGateway.charge).not.toHaveBeenCalled();
        });
        test('deve rejeitar usuário sem email', async () => {
            await expect(
                orderProcessor.processOrder({ id: 1 }, 100)
            ).rejects.toThrow('Usuário inválido');
            expect(paymentGateway.charge).not.toHaveBeenCalled();
        });


    });


    describe('Caminho Feliz', () => {
        test('deve processar pagamento com sucesso', async () => {
            paymentGateway.charge.mockResolvedValue(true);
            const usuario = {
                id: 1,
                email: 'teste@email.com'
            };
            const resultado =
                await orderProcessor.processOrder(usuario, 500);
            expect(resultado).toEqual({
                status: 'SUCCESS'
            });
            expect(emailService.sendReceipt)
                .toHaveBeenCalledWith(
                    'teste@email.com',
                    500
                );
        });


    });


    describe('Pagamento Recusado', () => {
        test('deve enviar notificação de falha', async () => {
            paymentGateway.charge.mockResolvedValue(false);
            const usuario = {
                id: 1,
                email: 'teste@email.com'
            };
            await expect(
                orderProcessor.processOrder(usuario, 500)
            ).rejects.toThrow('Pagamento recusado');
            expect(emailService.sendFailureNotification)
                .toHaveBeenCalledWith('teste@email.com');
            expect(emailService.sendReceipt)
                .not.toHaveBeenCalled();
        });


    });


    describe('Falha de Infraestrutura', () => {
        test('deve propagar erro do gateway', async () => {
            paymentGateway.charge.mockRejectedValue(
                new Error('Timeout')
            );
            const usuario = {
                id: 1,
                email: 'teste@email.com'
            };
            await expect(
                orderProcessor.processOrder(usuario, 500)
            ).rejects.toThrow('Timeout');
        });


    });


});

