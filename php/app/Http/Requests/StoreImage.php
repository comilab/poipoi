<?php

namespace App\Http\Requests;

use App\Services\Image;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;

class StoreImage extends FormRequest
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
            'file' => ['required', 'file', 'image'],
        ];
    }

    public function storeAndResize()
    {
        $tempFile = $this->file('file')->store('temp');

        // large
        app(Image::class)->resize(
            Storage::path($tempFile),
            Storage::path("{$tempFile}.large"),
            1000,
            1000
        );

        // medium
        app(Image::class)->resize(
            Storage::path($tempFile),
            Storage::path("{$tempFile}.medium"),
            600,
            600
        );

        // small
        app(Image::class)->resize(
            Storage::path($tempFile),
            Storage::path("{$tempFile}.small"),
            250,
            250
        );

        return $tempFile;
    }
}
