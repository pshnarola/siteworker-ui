import { Component, OnInit } from '@angular/core';
import { HeaderManagementService } from 'src/app/service/header-management.service';

@Component({
  selector: 'app-job-rating-and-review',
  templateUrl: './job-rating-and-review.component.html',
  styleUrls: ['./job-rating-and-review.component.css']
})
export class JobRatingAndReviewComponent implements OnInit {

  constructor(private captionChangeService: HeaderManagementService) { }



  maxStars: number = 5;

  initialStars: number = 0;

  readonly: boolean;

  size: number;

  color: string;

  animation: boolean;

  animationSpeed: number = 100;

  customPadding: string;

  wholeStars: boolean = false;

  customStarIcons: { empty: string, half: string, full: string };


  rating: number;
  editableStars: EditableStar[];
  animationInterval: any;
  animationRunning: boolean;

  private customCssClasses: HTMLStyleElement[];
  private customClassIdentifier = Math.random().toString(36).substring(2);

  ngOnInit(): void {
    this.setupStarImages();
    this.editableStars = Array.from(new Array(this.maxStars)).map((elem, index) => new EditableStar(index));
    this.setRating(this.initialStars);

    if (this.animation) {
      this.animationInterval = setInterval(this.starAnimation.bind(this), this.animationSpeed);
    }
  }

  ngOnDestroy(): void {
    if (this.customCssClasses) {
      this.customCssClasses.forEach(style => {
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
    }
  }

  private setupStarImages() {
    if (this.customStarIcons) {
      this.customCssClasses = [];
      Object.keys(this.customStarIcons).map(key => key as StarType).forEach(starType => {
        const classname = this.getStarClass(starType);
        this.createCssClass(classname, starType);
      });
    }
  }

  private createCssClass(classname: string, starType: StarType) {
    const clazz = document.createElement('style');
    clazz.type = 'text/css';
    clazz.innerHTML = `.${classname} {
      -webkit-mask-image: url(${this.customStarIcons[starType]});
      mask-image: url(${this.customStarIcons[starType]});
    }`;
    document.getElementsByTagName('head')[0].appendChild(clazz);
    this.customCssClasses.push(clazz);
  }

  starPadding(): { [p: string]: string } {
    return { 'margin-right': this.customPadding || `0.${this.safeSize()}rem` };
  }

  starColorAndSize(): { [p: string]: string } {
    return Object.assign({}, this.starColor(), this.starSize());
  }

  private starColor(): { [p: string]: string } {
    return { 'background-color': this.color || 'blue' };
  }

  starSize(): { [p: string]: string } {
    return {
      height: `${15 * this.safeSize()}px`,
      width: `${16 * this.safeSize()}px`,
    };
  }

  private safeSize = () => (Number.isInteger(this.size) && this.size > 0 && this.size < 6) ? this.size : 1;

  starAnimation(): void {
    this.animationRunning = true;
    if (this.rating < this.maxStars) {
      this.setRating(this.rating += 0.5);
    }
    else {
      this.setRating(0);
    }
  }

  cancelStarAnimation(): void {
    if (this.animationRunning) {
      clearInterval(this.animationInterval);
      this.rating = 0;
      this.animationRunning = false;
    }
  }

  setRating(rating: number) {
    this.rating = Math.round(rating * 2) / 2;
    this.onStarsUnhover();
  }

  onStarHover(event: MouseEvent, clickedStar: EditableStar): void {
    this.cancelStarAnimation();

    const clickedInFirstHalf = this.clickedInFirstHalf(event);

    // fill in either a half or whole star depending on where user clicked
    clickedStar.classname = (!this.wholeStars && clickedInFirstHalf) ? this.getStarClass('half') : this.getStarClass('full');

    // fill in all stars in previous positions and clear all in later ones
    this.editableStars.forEach(star => {
      if (star.position > clickedStar.position) {
        star.classname = this.getStarClass('empty');
      }
      else if (star.position < clickedStar.position) {
        star.classname = this.getStarClass('full');
      }
    });
  }

  onStarClick(event: MouseEvent, clickedStar: EditableStar): void {
    this.cancelStarAnimation();

    const clickedInFirstHalf = this.clickedInFirstHalf(event);
    this.rating = clickedStar.position + ((!this.wholeStars && clickedInFirstHalf) ? 0.5 : 1);
  }

  onZeroStarClick(): void {
    this.setRating(0);

  }

  onZeroStarHover(): void {
    // clear all stars
    this.editableStars.forEach(star => star.classname = this.getStarClass('empty'));
  }

  onStarsUnhover() {
    this.editableStars.forEach(star => {
      const starNumber = star.position + 1;
      if (this.rating >= starNumber) {
        star.classname = this.getStarClass('full');
      }
      else if (this.rating > starNumber - 1 && this.rating < starNumber) {
        star.classname = this.getStarClass('half');
      }
      else {
        star.classname = this.getStarClass('empty');
      }
    });
  }

  private clickedInFirstHalf(event: MouseEvent): boolean {
    const starIcon = event.target as HTMLElement;
    return event.pageX < starIcon.getBoundingClientRect().left + starIcon.offsetWidth / 2;
  }

  noop(): void { }

  private getStarClass(starType: StarType) {
    if (this.customCssClasses) {
      return `ngx-stars-star-${starType}-${this.customClassIdentifier}`;
    }
    return `star-${starType}`;
  }
}

export type StarType = 'empty' | 'half' | 'full';

export class EditableStar {
  position: number;
  classname: string;

  constructor(position: number) {
    this.position = position;
  }

}

