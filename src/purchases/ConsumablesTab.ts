import { sendToWebsocket } from '../Login'
import { memoize } from '../Utility'

interface ConsumableListItems {
  name: string
  description: string
  internalName: string
  length: string
  cost: number
}

const tab = document.querySelector<HTMLElement>('#pseudoCoins > #consumablesGrid')!

const initializeConsumablesTab = memoize(() => {
  fetch('https://synergism.cc/consumables/list')
    .then((r) => r.json())
    .then((consumables: ConsumableListItems[]) => {
      tab.innerHTML = consumables.map((u) => `
        <div
          data-key="${u.internalName}"
          style="margin: 40px;"
        >
          <img src='Pictures/PseudoShop/${u.internalName}.png' alt='${u.name} Consumable' />
          <p>${u.name}</p>
          <p>${u.description}</p>
          <button><p>Cost: </p><p>${u.cost} PseudoCoins</p></button>
        </div>
      `).join('')

      tab.querySelectorAll('div > button').forEach((element) => {
        const key = element.parentElement!.getAttribute('data-key')!
        element.addEventListener('click', () => {
          sendToWebsocket(JSON.stringify({
            type: 'consume',
            consumable: key
          }))
        })
      })
    })
})

export const toggleConsumablesTab = () => {
  initializeConsumablesTab()

  tab.style.display = 'flex'
}

export const clearConsumablesTab = () => {
  tab.style.display = 'none'
}
