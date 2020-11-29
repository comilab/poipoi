<?php

namespace App\Services;

use Intervention\Image\Facades\Image as FacadesImage;

class Image
{
    public function resize(string $from, string $to, int $width, int $height)
    {
        FacadesImage::make($from)
            ->resize($width, $height, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })
            ->save($to, 90, 'jpeg');
    }
}
