import { SubmitCloseOutAttachment } from '../../worker/vo/submitCloseOutRequestAttachment';
import { CloseoutPackageRequestDTO } from './CloseOutPackageRequestDTO';

export class SubmitCloseOutPackageRequestDTO{
    closeOutPackageRequest: CloseoutPackageRequestDTO;
    attachments: SubmitCloseOutAttachment[];
   

}
