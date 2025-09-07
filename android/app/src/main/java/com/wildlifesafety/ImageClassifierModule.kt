// FILE: ImageClassifierModule.kt
// This version is corrected with the proper model file name.

package com.wildlifesafety // Make sure this matches your project's package name

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.BufferedReader
import java.io.FileInputStream
import java.io.IOException
import java.io.InputStreamReader
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel
import org.tensorflow.lite.Interpreter

class ImageClassifierModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var tflite: Interpreter? = null
    private var labels: List<String>? = null
    private var initializationError: Exception? = null

    companion object {
        // --- CORRECTED MODEL FILENAME ---
        private const val MODEL_FILE = "snake_model.tflite" 
        private const val LABELS_FILE = "labels.txt"
        private const val INPUT_WIDTH = 224
        private const val INPUT_HEIGHT = 224
        private const val BYTES_PER_CHANNEL = 4 // Float32 model
        private const val CHANNELS = 3 // RGB
    }

    init {
        try {
            tflite = Interpreter(loadModelFile())
            labels = loadLabels()
            println("✅ TFLite model and labels loaded successfully.")
        } catch (e: Exception) {
            initializationError = e
            println("❌ TFLite model or labels failed to load: ${e.message}")
        }
    }

    override fun getName(): String {
        return "ImageClassifier"
    }

    @ReactMethod
    fun getModelFileName(promise: Promise) {
        if (initializationError != null) {
            promise.reject("InitializationError", "Model failed to initialize: ${initializationError?.message}")
        } else {
            promise.resolve(MODEL_FILE)
        }
    }

    @ReactMethod
    fun classifyImage(imageUri: String, promise: Promise) {
        if (initializationError != null) {
            promise.reject("InitializationError", "Image classifier is not initialized: ${initializationError?.message}")
            return
        }

        try {
            val bitmap = loadImage(imageUri)
            val resizedBitmap = Bitmap.createScaledBitmap(bitmap, INPUT_WIDTH, INPUT_HEIGHT, true)
            val byteBuffer = convertBitmapToByteBuffer(resizedBitmap)
            val output = Array(1) { FloatArray(labels?.size ?: 0) }

            tflite?.run(byteBuffer, output)

            val maxIndex = output[0].indices.maxByOrNull { output[0][it] } ?: -1
            if (maxIndex != -1 && labels != null) {
                promise.resolve(labels!![maxIndex])
            } else {
                promise.reject("ClassificationError", "Could not classify the image.")
            }
        } catch (e: Exception) {
            promise.reject("ClassificationError", "Error during image classification: ${e.message}")
        }
    }

    @Throws(IOException::class)
    private fun loadModelFile(): ByteBuffer {
        val assetManager = reactApplicationContext.assets
        val fileDescriptor = assetManager.openFd(MODEL_FILE)
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }
    
    @Throws(IOException::class)
    private fun loadLabels(): List<String> {
        val labels = mutableListOf<String>()
        try {
            val assetManager = reactApplicationContext.assets
            val inputStream = assetManager.open(LABELS_FILE)
            val reader = BufferedReader(InputStreamReader(inputStream))
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                line?.let { labels.add(it) }
            }
            reader.close()
            println("✅ Labels loaded: ${labels.size} classes")
            return labels
        } catch (e: Exception) {
            println("❌ Failed to load labels: ${e.message}")
            throw e
        }
    }
    
    @Throws(IOException::class)
    private fun loadImage(uriString: String): Bitmap {
        val inputStream = reactApplicationContext.contentResolver.openInputStream(Uri.parse(uriString))
        return BitmapFactory.decodeStream(inputStream).also {
            inputStream?.close()
        }
    }

    private fun convertBitmapToByteBuffer(bitmap: Bitmap): ByteBuffer {
        val byteBuffer = ByteBuffer.allocateDirect(1 * INPUT_WIDTH * INPUT_HEIGHT * CHANNELS * BYTES_PER_CHANNEL)
        byteBuffer.order(ByteOrder.nativeOrder())
        val intValues = IntArray(INPUT_WIDTH * INPUT_HEIGHT)
        bitmap.getPixels(intValues, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)

        var pixel = 0
        for (i in 0 until INPUT_WIDTH) {
            for (j in 0 until INPUT_HEIGHT) {
                val value = intValues[pixel++]
                // Normalize pixel values to [0, 1] for the Float32 model
                byteBuffer.putFloat(((value shr 16) and 0xFF) / 255.0f) // Red
                byteBuffer.putFloat(((value shr 8) and 0xFF) / 255.0f) // Green
                byteBuffer.putFloat((value and 0xFF) / 255.0f) // Blue
            }
        }
        return byteBuffer
    }
}