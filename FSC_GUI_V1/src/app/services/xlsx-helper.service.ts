import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { read, utils } from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class XlsxHelperService {
  _excelConfig = {
    fileName: 'Change Schedule Calendar',
    workSheetName: 'FSC',
    acceptedHeades: 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R',
    activity_type_header_name: 'Activity Type',
    headerNames: ['Change Number', 'Summary', 'Status', 'Hostname', 'Scheduled Start', 'Scheduled Finish', 'Owner Group', 'Owner Name',
      'Master Application', 'Environment', 'Master Instance', 'Danone PO', 'Danone SM', 'Kyndryl PO', 'Kyndryl SM', 'Activity Type', 'Month']
  };

  cachedData: any;
  private _snackBar = inject(MatSnackBar);
  activityTypeColumnKey: string = 'P';
  startDateColumnKey: string = 'E';
  endColumnKey: string = 'F';
  changeColumnKey: string = 'A';
  masterAppKey: string = 'I';
  enviromentKey: string = 'J';
  hostNameKey: string = 'D';

  constructor() { }

  async readExcelFileFromPublicFolder(): Promise<void> {
    try {
      const FSC_DATA = localStorage.getItem(this._excelConfig.workSheetName);
      if (FSC_DATA) {
        this.cachedData = JSON.parse(FSC_DATA);
        return new Promise<void>((resolve, reject) => {
          resolve();
        })
      }
      const f = await fetch(`/${this._excelConfig.fileName}.xlsx`);
      const ab = await f.arrayBuffer();
      const wb = read(ab, { sheets: this._excelConfig.workSheetName });
      const ws = wb.Sheets[this._excelConfig.workSheetName];
      this.cachedData = utils.sheet_to_json<any>(ws, { blankrows: false, defval: null, skipHidden: true, header: this._excelConfig.acceptedHeades.split(','), raw: false, dateNF: 'DD-MM-YYYY' });
      localStorage.setItem(this._excelConfig.workSheetName, JSON.stringify(this.cachedData));
    } catch (e) {
      this._snackBar.open(JSON.stringify(e));
    }
  }

  getActivityType(): Array<string> {
    const uniqueATypes: Array<string> = [];

    this.cachedData.forEach((row: any, index: number) => {
      if (index > 0 && row[this.activityTypeColumnKey]) {
        const activity = row[this.activityTypeColumnKey]
        activity && uniqueATypes.push(activity);
      }
    })

    return Array.from(new Set(uniqueATypes));
  }

  getMasterApplicationType(): Array<string> {
    const uniqueATypes: Array<string> = [];

    this.cachedData.forEach((row: any, index: number) => {
      if (index > 0 && row[this.masterAppKey]) {
        const activity = row[this.masterAppKey]
        activity && uniqueATypes.push(activity);
      }
    })

    return Array.from(new Set(uniqueATypes));
  }

  getEnvType(): Array<string> {
    const uniqueATypes: Array<string> = [];

    this.cachedData.forEach((row: any, index: number) => {
      if (index > 0 && row[this.enviromentKey]) {
        const activity = row[this.enviromentKey]
        activity && uniqueATypes.push(activity);
      }
    })

    return Array.from(new Set(uniqueATypes));
  }

  filterDropDownData(filterData: any) {
    const filteredData = this.cachedData.filter((row: any) => {
      const a_type = filterData.activity_type;
      const m_app = filterData.m_app;
      const env = filterData.env;
      const tempFilterArray = [{ key: this.activityTypeColumnKey, value: a_type }, { key: this.masterAppKey, value: m_app }, { key: this.enviromentKey, value: env }];
      const filterArray = tempFilterArray.filter(x => x.value);
        // if (!filterArray.length) {
      //   return false;
      // }
      return filterArray.every((fA) => row[fA.key] === fA.value);
    });
    return filteredData;
  }

  refresh() {
    localStorage.removeItem(this._excelConfig.workSheetName);
  }

}
