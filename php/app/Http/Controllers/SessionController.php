<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSession;
use App\Http\Resources\User as ResourcesUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum', ['except' => ['store']]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return new ResourcesUser(auth()->user());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  StoreSession  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreSession $request)
    {
        if (!Auth::attempt($request->only(['email', 'password']))) {
            abort(401);
        }

        /** @var \App\Models\User */
        $user = auth()->user();
        $user->tokens()->where('name', $request->input('device_name'))->delete();
        $token = $user->createToken($request->input('device_name'));

        return response()->json([
            'token' => $token->plainTextToken,
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        /** @var \App\Models\User */
        $user = auth()->user();

        Auth::guard('web')->logout();
        $user->tokens()->delete();

        return response()
            ->json(['message' => 'Successfully logged out']);
    }
}
