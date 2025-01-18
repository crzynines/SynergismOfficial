import { prod } from '../Config'
import { Alert, Notification } from '../UpdateHTML'
import { memoize } from '../Utility'
import { type Product, subscriptionProducts, upgradeResponse } from './CartTab'
import { addToCart, getQuantity } from './CartUtil'

const subscriptionsContainer = document.querySelector<HTMLElement>('#pseudoCoins > #subscriptionsContainer')!
const subscriptionSectionHolder = subscriptionsContainer.querySelector<HTMLElement>('#sub-section-holder')!

const formatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const tierCosts = [0, 300, 600, 1000, 2000]

const clickHandler = (e: HTMLElementEventMap['click']) => {
  const productId = (e.target as HTMLButtonElement).getAttribute('data-id')
  const productName = (e.target as HTMLButtonElement).getAttribute('data-name')

  if (productId === null || !subscriptionProducts.some((product) => product.id === productId)) {
    Alert('Stop fucking touching the html! We do server-side validation!')
    return
  } else if (subscriptionProducts.some((product) => getQuantity(product.id) !== 0)) {
    Alert('You can only subscribe to 1 subscription tier!')
    return
  }

  addToCart(productId)
  Notification(`Added ${productName} to the cart!`)
}

const constructDescriptions = (description: string) => {
  const [firstLine, secondLine] = description.split(' and ')
  // capitalize the first letter of the second line
  const secondLineCap = secondLine.charAt(0).toUpperCase() + secondLine.slice(1)

  return `<span style="color: gold">${firstLine}</span>
            <br>
            <span style="color: cyan">${secondLineCap}</span>`
}

export const createIndividualSubscriptionHTML = (product: Product, existingCosts: number) => {
  if (product.price < existingCosts) {
    return `
      <section class="subscriptionContainer" key="${product.id}">
      <div>
          <img class="pseudoCoinImage" alt="${product.name}" src="./Pictures/${product.id}.png" />
          <p class="pseudoCoinText">
          ${product.name.split(' - ').join('<br>')}
          </p>
          <p class="pseudoSubscriptionText">
          ${constructDescriptions(product.description)}
          </p>
          <button data-id="${product.id}" data-name="${product.name}" class="pseudoCoinButton" style="background-color: maroon">
          Downgrade!
          </button>
      </div>
      </section>
    `
  } else if (product.price === existingCosts) {
    return `
      <section class="subscriptionContainer" key="${product.id}">
      <div>
          <img class="pseudoCoinImage" alt="${product.name}" src="./Pictures/${product.id}.png" />
          <p class="pseudoCoinText">
          ${product.name.split(' - ').join('<br>')}
          </p>
          <p class="pseudoSubscriptionText">
          ${constructDescriptions(product.description)}
          </p>
          <button data-id="${product.id}" data-name="${product.name}" class="pseudoCoinButton" style="background-color: #b59410">
          You are here!
          </button>
      </div>
      </section>
    `
  } else {
    return `
      <section class="subscriptionContainer" key="${product.id}">
      <div>
          <img class="pseudoCoinImage" alt="${product.name}" src="./Pictures/${product.id}.png" />
          <p class="pseudoCoinText">
          ${product.name.split(' - ').join('<br>')}
          </p>
          <p class="pseudoSubscriptionText">
          ${constructDescriptions(product.description)}
          </p>
          <button data-id="${product.id}" data-name="${product.name}" class="pseudoCoinButton">
          Upgrade for ${formatter.format((product.price - existingCosts) / 100)} USD / mo
          </button>
      </div>
      </section>
    `
  }
}

export const initializeSubscriptionPage = memoize(() => {
  // Manage subscription button
  {
    const form = document.createElement('form')
    form.action = !prod
      ? 'https://synergism.cc/stripe/test/manage-subscription'
      : 'https://synergism.cc/stripe/manage-subscription'

    const submit = document.createElement('input')
    submit.type = 'submit'
    submit.value = 'Manage Subscription'
    form.appendChild(submit)

    subscriptionsContainer.prepend(form)
  }

  const tier = upgradeResponse.tier
  const existingCosts = tierCosts[tier] ?? 0

  subscriptionSectionHolder.innerHTML = subscriptionProducts.map((product) =>
    createIndividualSubscriptionHTML(product, existingCosts)
  ).join('')

  subscriptionSectionHolder!.style.display = 'grid'

  document.querySelectorAll<HTMLButtonElement>('.subscriptionContainer > div > button[data-id]').forEach(
    (element) => {
      element.addEventListener('click', clickHandler)
    }
  )
})

export const clearSubscriptionPage = () => {
  subscriptionsContainer.style.display = 'none'
}

export const toggleSubscriptionPage = () => {
  initializeSubscriptionPage()
  subscriptionsContainer.style.display = 'flex'
}
