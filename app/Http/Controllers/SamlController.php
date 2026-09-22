<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Socialite;

class SamlController extends Controller
{
    //
    public function redirect()
    {
        // Redirect ke SSO menggunakan Socialite
        return Socialite::driver('saml2')->redirect();
    }
}
