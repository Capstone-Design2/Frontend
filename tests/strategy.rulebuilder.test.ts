import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'

function findByLabel(wrapper:any, text:string){
  return wrapper.findAll('label').find((l:any)=> l.text().includes(text))
}

describe('RuleBuilder', () => {
  it('validates and emits schema', async () => {
    const wrapper = mount(RuleBuilder)
    // fill name
    await wrapper.find('input#name').setValue('My Strat')
    // enable SMA and set period
    await findByLabel(wrapper,'SMA')!.find('input').setValue(true)
    await wrapper.find('#sma-period').setValue('20')
    // set SL/TP and sizing
    await wrapper.find('#sl').setValue('5')
    await wrapper.find('#tp').setValue('10')
    await wrapper.find('#ps-mode').setValue('percent')
    const sizing = wrapper.find('[aria-label="Position sizing value"]')
    await sizing.setValue('10')

    // save
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeUndefined()
    await btn.trigger('submit')

    const emits = wrapper.emitted('save')
    expect(emits).toBeTruthy()
    const payload = emits![0][0]
    expect(payload.name).toBe('My Strat')
    expect(payload.indicators.sma.period).toBe(20)
    expect(payload.positionSizing.mode).toBe('percent')
    expect(payload.rules.stopLoss).toBe(5)
    expect(payload.rules.takeProfit).toBe(10)
    expect(payload).toEqual({
      schemaVersion: 1,
      name: 'My Strat',
      description: '',
      indicators: { sma: { enabled: true, period: 20 } },
      rules: { buy: [], sell: [], stopLoss: 5, takeProfit: 10 },
      positionSizing: { mode: 'percent', value: 10 }
    })
  })
})
