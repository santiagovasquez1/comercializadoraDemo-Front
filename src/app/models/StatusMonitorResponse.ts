import { StatusMonitor } from './StatusMonitor';
import { ResponseBase } from './ResponseBase';
export interface StatusMonitorResponse extends ResponseBase{
    statusMonitor:StatusMonitor
}