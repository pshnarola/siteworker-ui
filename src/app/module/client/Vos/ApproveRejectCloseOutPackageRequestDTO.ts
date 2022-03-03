import { CloseoutPackageRequestDTO } from '../../subcontractor/vos/CloseOutPackageRequestDTO';

export class ApproveRejectCloseOutPackageRequestDTO{
    closeOutPackages: CloseoutPackageRequestDTO[];
    reasonToReject: string;
}