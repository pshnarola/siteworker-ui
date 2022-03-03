import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-rich-editor',
  templateUrl: './rich-editor.component.html',
  styleUrls: ['./rich-editor.component.css']
})
export class RichEditorComponent implements OnInit {
  @ViewChild('ed') ed: EditorModule;
  text1: string = '<div>Hello World!</div><div>PrimeNG <b>Editor</b> Rocks</div><div><br></div>';
  myForm: FormGroup;
  tab = {
    key: 9,
    handler: function () {
      return false;
    }
  };
  constructor() {
    this.myForm = new FormGroup({
      tetx1: new FormControl(null)
    })
  }

  ngOnInit(): void {
  }

  console() {
    console.log(this.text1);
  }

  editorcall(event: any) {
    event.editor.keyboard.bindings[9].length = 0;
    event.editor.keyboard.bindings[9].push(this.tab);
  }
}
