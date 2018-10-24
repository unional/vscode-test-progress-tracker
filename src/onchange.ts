import { GetLastLineContext, monitor, MonitorContext, TestResults, MonitorSubscription } from '@unional/test-progress-tracker';

let monitoring: MonitorSubscription

export interface OnChangeContext {
  showErrorMessage(message: string, ...items: any[]): any
}

const listeners: ((testResults: TestResults) => void)[] = []
export function onchange(context: Partial<MonitorContext & GetLastLineContext> & OnChangeContext, listener: (testResults: TestResults) => void) {
  listeners.push(listener)
  if (!monitoring) {
    monitoring = monitor(context, (err, testResults) => {
      if (err) {
        context.showErrorMessage(`Monitoring progress error:`, err)
      }
      else { listeners.forEach(l => l(testResults)) }
    })
  }
  return monitoring
}
