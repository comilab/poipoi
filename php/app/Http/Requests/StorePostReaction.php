<?php

namespace App\Http\Requests;

use App\Services\Emoji;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostReaction extends FormRequest
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
        $emojiRules = ['required', 'string'];

        $allEmojis = app(Emoji::class)->all();
        $emojis = $this->getPost()->emojis;

        if ($emojis->isNotEmpty()) {
            $emojiRules[] = Rule::in($emojis);
        } else {
            $emojiRules[] = Rule::in($allEmojis);
        }

        return [
            'emoji' => $emojiRules,
        ];
    }

    protected function getPost(): \App\Models\Post
    {
        return $this->route('post');
    }
}
