<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;

class SavePost extends FormRequest
{
    use CamelCaseKeys;

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
        $post = $this->getPost();
        if ($post) {
            $post->loadMissing('images');
        }

        $rules = [
            'title' => ['max:32'],
            'caption' => ['max:200'],
            'showImagesList' => ['required', 'boolean'],
            'text'=> ['max:300000'],
            'scope' => ['in:public,password,private'],
            'password' => ['required_if:scope,password'],
            'publishStart' => ['nullable', 'date'],
            'publishEnd' => ['nullable', 'date'],
            'rating' => ['nullable', 'in:nsfw,r18'],
            'pinned' => ['required', 'boolean'],
            'showThumbnail' => ['required', 'boolean'],
            'denyRobot' => ['nullable', 'boolean'],
            'enableReaction' => ['nullable', 'boolean'],
            'allowedEmojis' => ['nullable', 'array'],
            'allowedEmojis.*' => 'string',
            'deniedEmojis' => ['nullable', 'array'],
            'deniedEmojis.*' => 'string',
            'enableTwitterShare' => ['nullable', 'boolean'],
            'images' => ['array', 'max:200'],
            'images.*' => [
                function ($attribute, $value, $fail) use ($post) {
                    if (is_string($value)) {
                        if (!Storage::exists($value)) {
                            $fail("{$attribute} is invalid.");
                        }
                    } else if ($post) {
                        if (!isset($value['id']) || !$post->images->firstWhere('id', $value['id'])) {
                            $fail("{$attribute} is invalid.");
                        }
                    }
                },
            ],
        ];

        if ($this->input('publishStart')) {
            $rules['publishEnd'][] = 'after:publishStart';
        }
        if ($this->input('publishEnd')) {
            $rules['publishStart'][] = 'before:publishEnd';
        }

        if (!$post) {
            array_unshift($rules['images.*'], 'string');
        }

        return $rules;
    }

    protected function getPost(): ?\App\Models\Post
    {
        return $this->route('post');
    }
}
