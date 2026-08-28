<?php

namespace App\Enums;

enum ExtendRequestStatus: string
{
    case PendingTlApproval = 'pending_tl_approval';
    case PendingHodApproval = 'pending_hod_approval';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
