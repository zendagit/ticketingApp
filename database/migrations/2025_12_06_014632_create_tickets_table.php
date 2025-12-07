<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            // status values
            $table->enum('status', ['open', 'in_progress', 'completed'])->default('open');
            // who created the ticket (admin)
            $table->unsignedBigInteger('created_by')->nullable();
            // who is assigned (employee)
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->timestamps();

            // foreign keys (set to NULL if user deleted)
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tickets');
    }
};
