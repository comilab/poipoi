<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSetting extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'settings.siteTitle' => ['required', 'max:32'],
            'settings.siteDescription' => ['max:200'],
            'settings.perPage' => ['required', 'integer', 'min:1'],
            'settings.denyRobot' => ['required', 'boolean'],
            'settings.enableFeed' => ['required', 'boolean'],
            'settings.postDefault.denyRobotScope' => ['array'],
            'settings.postDefault.enableReaction' => ['required', 'boolean'],
            'settings.postDefault.enableTwitterShare' => ['required', 'boolean'],
            'settings.postDefault.allowedEmojis' => ['array'],
            'settings.postDefault.allowedEmojis.*' => ['string'],
            'settings.postDefault.deniedEmojis' => ['array'],
            'settings.postDefault.deniedEmojis.*' => ['string'],
            'user.name' => ['required'],
            'user.email' => ['required', 'email'],
            'user.password' => ['nullable'],
        ];
    }
}
