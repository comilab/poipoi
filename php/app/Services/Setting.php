<?php

namespace App\Services;

use \App\Models\Setting as SettingModel;
use Illuminate\Support\Arr;

class Setting
{
    protected $setting;

    public function __construct()
    {
        $this->setting = SettingModel::first();
    }

    public function all()
    {
        return $this->setting->data;
    }

    public function get($key = null, $default = null)
    {
        return Arr::get($this->all(), $key, $default);
    }

    public function set($key, $value, $save = true)
    {
        $data = $this->all();

        if (Arr::has($data, $key)) {
            Arr::set($data, $key, $value);
        }

        $this->setting->data = $data;

        if ($save) {
            $this->save();
        }
    }

    public function replace($values, $save = true)
    {
        $dotted = Arr::dot($values);

        foreach ($dotted as $key => $value) {
            $this->set($key, $value, false);
        }

        if ($save) {
            $this->save();
        }
    }

    public function save()
    {
        $this->setting->save();
        $this->refresh();
    }

    public function refresh()
    {
        $this->setting->refresh();
    }

    public function fake($values = [])
    {
        $this->setting = SettingModel::factory()->make();
        $this->replace($values, false);

        return $this;
    }
}
