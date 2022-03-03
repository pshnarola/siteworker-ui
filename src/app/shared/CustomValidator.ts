import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { COMMON_CONSTANTS } from './CommonConstants';
import { ValidationResult } from './ValidationResult';



export class CustomValidator {


    static required(control: FormControl): ValidationResult {
        if ((control.value === undefined || control.value === null || (control.value === '' || (typeof (control.value) === 'string' && control.value.trim() === '')))) {
            return { 'required': true };
        }
        return null;
    }

    static numericValidation(control: FormControl): ValidationResult {
        const NUMERIC_REGEXP = /^[0-9]*$/i;
        if (control.value !== '' && !NUMERIC_REGEXP.test(control.value)) {
            return { 'incorrectNumericFormat': true };
        }
        return null;
    }
    static isNumberCheck(): ValidatorFn {
        return  (c: AbstractControl): {[key: string]: boolean} | null => {
          let number = /^[.\d]+$/.test(c.value) ? +c.value : NaN;
          if (number !== number) {
            return { 'value': true };
          }
    
          return null;
        };
      }
    static emailValidator(control: FormControl): ValidationResult {
        const EMAIL_REGEXP = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
        if (control.value !== '' && !EMAIL_REGEXP.test(control.value)) {
            return { 'incorrectEmailFormat': true };
        }
        return null;
    }
    static clientEmailValidator(control: FormControl): ValidationResult {
        const EMAIL_REGEXP = /^([\w-\.]+@(?!gmail.com)(?!yahoo.com)(?!aol.com)(?!outlook.com)(?!zoho.com)(?!mail.com)(?!protonmail.com)(?!icloud.com)(?!gmx.com)(?!yandex.com)(?!hubspot.com)(?!hotmail.com)(?!yahoo.co.in)([\w-]+\.)+[\w-]{2,4})?$/i;
        if (control.value !== '' && !EMAIL_REGEXP.test(control.value)) {
            return { 'incorrectEmailFormat': true };
        }
        return null;
    }

    static MobilePhoneValidator(control: FormControl): ValidationResult {
        const MOBILEPHONE_REGEXP = /^[(]?\d{3}[)]?[(\s)?.-]\d{3}[\s.-]\d{4}$/g;
        if (control.value !== '' && !MOBILEPHONE_REGEXP.test(control.value)) {
            return { 'incorrectMobilePhoneFormat': true };
        }
        return null;
    }

    static passWordValidator(control: FormControl): ValidationResult {
        const PASSWORD_REGEXP = COMMON_CONSTANTS.PASSWORD_REGX;
        // should contain one digit, one lowercase, one uppercase, one special charater and at between 6 to 20 character long
        if (control.value !== "" && !control.value.match(PASSWORD_REGEXP)) {

            return { incorrectPasswordFormat: true };
        }

        return null;
    }

    static passwordConfirming(c: FormControl): ValidationResult {
        let validationResult: ValidationResult;
        if (c.get('password') !== null && c.get('confirmPassword') !== null) {
            validationResult = (c.get('password').value === '') ? { passwordRequired: true } : null;
            if (validationResult === null) {
                validationResult = (c.get('password').value !== c.get('confirmPassword').value) ? { misMatchConfirmPassword: true } : null;
            }
        }
        return validationResult;
    }

    static markFormGroupTouched(form: FormGroup): void {
        Object.values(form.controls).forEach(control => {
            control.markAsTouched();
            control.markAsDirty();

            if ((control as any).controls) {
                this.markFormGroupTouched(control as FormGroup);
            }
        });
    }

    // static passwordConfirming1(c: FormControl): ValidationResult {
    //     let validationResult: ValidationResult;
    //     if (c != null) {
    //         if (c.value !== null && c.root.get('password').value !== null) {
    //             validationResult = (c.root.get('password').value === '') ? { passwordRequired: true } : null;
    //             if (validationResult === null) {
    //                 validationResult = (c.root.get('password').value !== c.value) ? { misMatchConfirmPassword: true } : null;
    //             }
    //         }
    //     }
    //     return validationResult;
    // }

    // static passwordsMatch(password: string, confirmedPassword: string) {
    //     return (control: FormControl): { [s: string]: boolean } => {
    //         console.log(password, confirmedPassword);
    //         //if I change this condition to === it throws the error if the 
    //         //  two fields are the same, so this part works
    //         if (password !== confirmedPassword) {
    //             return { 'passwordMismatch': true }
    //         } else {
    //             //it always gets here no matter what
    //             return null;
    //         }
    //     }
    // }


}
