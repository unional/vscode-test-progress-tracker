import { monitor, MonitorSubscription, TestResults } from 'test-progress-tracker';

let set = new Map<string, {
  subscription: MonitorSubscription,
  listeners: ((testResults: TestResults) => void)[]
}>()

export interface OnChangeContext {
  showErrorMessage(message: string, ...items: any[]): any
}

export function onchange(context: OnChangeContext, rootDir: string, listener: (testResults: TestResults) => void) {
  let entry = set.get(rootDir)

  if (!entry) {
    const listeners = [listener]
    const subscription = monitor({ rootDir }, (err, testResults) => {
      if (err) {
        context.showErrorMessage(`Monitoring progress error: ${err}`)
      }
      else {
        const e = set.get(rootDir)
        if (e) {
          e.listeners.forEach(l => l(testResults))
        }
      }
    })
    entry = { subscription, listeners }
    set.set(rootDir, entry)
  }
  else {
    entry.listeners.push(listener)
  }
  return entry.subscription
}
