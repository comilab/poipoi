<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSetting;
use App\Http\Resources\Setting as ResourcesSetting;
use App\Services\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SettingController extends Controller
{
    protected $setting;

    public function __construct(Setting $setting)
    {
        $this->setting = $setting;

        $this->middleware('auth:sanctum', ['except' => ['index']]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return new ResourcesSetting($this->setting->all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  UpdateSetting  $request
     * @return \Illuminate\Http\Response
     */
    public function store(UpdateSetting $request)
    {
        $this->setting->replace($request->validated()['settings'], false);

        /** @var \App\Models\User */
        $user = auth()->user();
        $user->fill(Arr::except($request->validated()['user'], 'password'));
        if ($request->filled('user.password')) {
            $user->password = Hash::make($request->input('user.password'));
        }

        DB::transaction(function() use ($user) {
            $this->setting->save();
            $user->save();
        });

        return new ResourcesSetting($this->setting->all());
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Setting  $setting
     * @return \Illuminate\Http\Response
     */
    public function show(Setting $setting)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Setting  $setting
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Setting $setting)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Setting  $setting
     * @return \Illuminate\Http\Response
     */
    public function destroy(Setting $setting)
    {
        //
    }
}
