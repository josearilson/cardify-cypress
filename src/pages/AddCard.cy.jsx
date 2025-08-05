import React from 'react'
import AddCard from './AddCard'


Cypress.Commands.add('alertErrorHaveText', (expectedText) => {
  cy.contains('.alert-error', expectedText)
    .should('be.visible')
})


Cypress.Commands.add('fillCardForm', (myCard) => {

  cy.get('[data-cy="number"]').type(myCard.number)
  cy.get('[data-cy="holderName"]').type(myCard.holderName)
  cy.get('[data-cy="expirationDate"]').type(myCard.expirationDate)
  cy.get('[data-cy="cvv"]').type(myCard.cvv)

  cy.get(`[data-cy="bank-${myCard.bank}"]`).click()
})

Cypress.Commands.add('submitCardForm', () => {
  cy.get('[data-cy="saveMyCard"]').click()

})
describe('<AddCard />', () => {

  const myCard = {
    number: '347974535272064',
    holderName: 'Jose Arilson',
    expirationDate: '12/35',
    cvv: '123',
    bank: 'nubank'
  }
  beforeEach(() => {

    cy.viewport(1400, 900)
    cy.mount(<AddCard />)

  })

  it('exibe erros quando os campos não são informados', () => {

    cy.submitCardForm()

    const alerts = [
      'Número do cartão é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco'
    ]

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert)
    })

  })

  it('Deve cadastrar um novo cartao de credito', () => {

    cy.fillCardForm(myCard)
    // Intercepta as requisições GET .
    cy.intercept('POST', 'http://wallet.cardfify.dev/api/cards', {
      statusCode: 201,
      body: myCard
    }).as('addCard');
    
    cy.submitCardForm()    
    cy.wait('@addCard');
    
    cy.get('.notice-success')
    .should('be.visible')
    .and('have.text','Cartão cadastrado com sucesso!')

  })

  it('Valida campo de nome titular com menos de 2 caracteres', () => {

    cy.fillCardForm({ ...myCard, holderName: 'J' })      
    cy.submitCardForm()
    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres')

  })

  it('Valida data de expiracao invalida', () => {

    cy.fillCardForm({ ...myCard, expirationDate: '13/35' }) 
    cy.submitCardForm()
    cy.alertErrorHaveText('Data de expiração inválida ou vencida')

  })

  it('Valida cvv com menos de 3 digitos', () => {

    cy.fillCardForm({ ...myCard, cvv: '12' })
    cy.submitCardForm()
    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos')

  })

})