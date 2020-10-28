<?php

namespace App\Services;

class Emoji
{
    /**
     * @var \Illuminate\Support\Collection
     */
    protected $data;

    public function __construct()
    {
        $json = file_get_contents(base_path('node_modules/emoji.json/emoji-compact.json'));
        $data = json_decode($json);
        $this->data = collect($data);
    }

    public function all()
    {
        return $this->data;
    }

    /**
     * @param int|null $length
     * @return \Illuminate\Support\Collection|string
     */
    public function random(int $length = null)
    {
        if (!$length) {
            $length = rand(1, $this->data->count());
        }

        return $this->data->random($length);
    }

    public function isEmoji(string $char)
    {
        return $this->data->contains($char);
    }
}
