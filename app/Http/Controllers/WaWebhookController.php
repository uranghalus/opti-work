<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WaWebhookController extends Controller
{
    //
    public function handle(Request $request)
    {
        // Evolution API mengirimkan ID tombol ke path ini
        $buttonId = $request->input('data.message.buttonsResponseMessage.selectedButtonId')
            ?? $request->input('data.message.listResponseMessage.singleSelectReply.selectedRowId');

        if (! $buttonId) {
            return response()->json(['status' => 'ignored']);
        }

        // Parsing Button ID (contoh: approve_wo_15)
        if (str_starts_with($buttonId, 'approve_wo_') || str_starts_with($buttonId, 'reject_wo_')) {
            $parts = explode('_wo_', $buttonId);
            $action = $parts[0]; // 'approve' atau 'reject'
            $woId = $parts[1];   // '15'

            $wo = WorkOrder::find($woId);

            if ($wo) {
                if ($action === 'approve') {
                    $wo->update(['status_tiket' => 'Executed']);
                } else {
                    $wo->update(['status_tiket' => 'Rejected']);
                }
                Log::info("WO {$woId} via WA Webhook status changed to: {$action}");
            }
        }

        return response()->json(['status' => 'success']);
    }
}
