import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.css']
})
export class ReadMoreComponent implements OnInit {

  @Input() content: string;
  @Input() limit: number;
  @Input() completeWords: boolean;

  isContentToggled: boolean;
  nonEditedContent: string;

  constructor() {

  }

  ngOnInit() {
    console.log(this.content);
    this.nonEditedContent = this.content;
    this.content = this.formatContent(this.content);
  }

  toggleContent(event) {
    this.isContentToggled = !this.isContentToggled;
    this.content = this.isContentToggled ? this.nonEditedContent : this.formatContent(this.content);
    event.preventDefault();
  }

  formatContent(content: string) {
    if (this.completeWords) {
      this.limit = content.substr(0, this.limit).lastIndexOf(' ');
    }
    return `${content.substr(0, this.limit)}...`;
  }



}
