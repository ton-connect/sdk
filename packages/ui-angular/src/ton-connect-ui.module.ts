import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { TonConnectButtonComponent } from './components';
import { TonConnectUIService } from './services';

@NgModule({
  declarations: [TonConnectButtonComponent],
  imports: [CommonModule],
  exports: [TonConnectButtonComponent],
  providers: [TonConnectUIService],
})
export class TonConnectUIModule {
  static forRoot(config: {
    options: Provider;
  }): ModuleWithProviders<TonConnectUIModule> {
    return {
      ngModule: TonConnectUIModule,
      providers: [config.options],
    };
  }
}
