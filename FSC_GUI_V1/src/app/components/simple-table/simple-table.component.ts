import { DataSource } from '@angular/cdk/collections';
import { Component, Input } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-simple-table',
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.scss'
})
export class SimpleTableComponent {
  @Input() ELEMENT_DATA: any;
  dataSource = new ExampleDataSource([]);
  displayedColumns: string[] = ['Change', 'Summary', 'OWNERGROUP', 'OWNER', 'STATUS', 'SCHEDSTART', 'SCHEDEND', 'CUSTOMER', 'CINUM', 'Master Application', 'Kyndryl SM', 'Danone PO', 'Danone SM', 'Activity Type'];
  showTable:boolean | undefined;

  constructor() {
  }

  setNewData(data: any) {
    this.showTable = true;
    this.dataSource.setData(data);
  }
}

class ExampleDataSource extends DataSource<any> {
  private _dataStream = new ReplaySubject<any[]>();

  constructor(initialData: any[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<any[]> {
    return this._dataStream;
  }

  disconnect() { }

  setData(data: any[]) {
    this._dataStream.next(data);
  }
}
