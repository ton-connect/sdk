import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
} from '@angular/core';
import { TonConnectUIService } from '../../services';

const BUTTON_ID = 'ton-connect-button';

@Component({
  selector: 'tc-connect-button',
  templateUrl: './ton-connect-button.component.html',
  styleUrls: ['./ton-connect-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TonConnectButtonComponent implements AfterViewInit, OnDestroy {
  @HostBinding('attr.id')
  buttonId = BUTTON_ID;

  constructor(private readonly _tonConnectUIService: TonConnectUIService) {}

  ngAfterViewInit(): void {
    this._tonConnectUIService.updateOptions({
      buttonRootId: BUTTON_ID,
    });
  }

  ngOnDestroy(): void {
    this._tonConnectUIService.updateOptions({
      buttonRootId: null,
    });
  }
}
