// FILE: ImageClassifierModule.kt
// This version is updated for robustness and clear error handling.

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
        private const val MODEL_FILE = "snake_model.tflite"
        private const val LABELS_FILE = "labels.txt"
        private const val INPUT_WIDTH = 224
        private const val INPUT_HEIGHT = 224
        private const val BYTES_PER_CHANNEL = 4 // Float32 model
        private const val CHANNELS = 3 // RGB
    }

    init {
        // Initialize the classifier when the module is created
        initializeClassifier()
    }

    override fun getName() = "ImageClassifier"

    // Use @Synchronized to prevent race conditions during initialization
    @Synchronized
    private fun initializeClassifier() {
        if (tflite != null) return // Already initialized

        try {
            // Load the model from the app's assets folder
            val modelBuffer = loadModelFile()
            tflite = Interpreter(modelBuffer)
            
            // Load the labels from the app's assets folder
            labels = loadLabels()
            
            println("✅ TFLite Interpreter and labels initialized successfully.")

        } catch (e: Exception) {
            initializationError = e
            println("❌ TFLITE INITIALIZATION FAILED: ${e.message}")
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun classifyImage(imageUri: String, promise: Promise) {
        // First, check if initialization failed
        if (tflite == null || labels == null) {
            val errorMessage = initializationError?.message ?: "Classifier is not initialized."
            promise.reject("INIT_ERROR", "Failed to initialize TFLite classifier: $errorMessage")
            return
        }

        try {
            // 1. Load the image from the URI and resize it
            val bitmap = loadImage(imageUri)
            val resizedBitmap = Bitmap.createScaledBitmap(bitmap, INPUT_WIDTH, INPUT_HEIGHT, true)

            // 2. Convert the bitmap to a ByteBuffer for the model
            val byteBuffer = convertBitmapToByteBuffer(resizedBitmap)

            // 3. Prepare the output buffer
            val outputBuffer = Array(1) { FloatArray(labels!!.size) }

            // 4. Run inference
            tflite?.run(byteBuffer, outputBuffer)

            // 5. Find the result with the highest confidence
            val maxIndex = outputBuffer[0].indices.maxByOrNull { outputBuffer[0][it] } ?: -1
            if (maxIndex == -1) {
                promise.reject("INFERENCE_ERROR", "Could not determine prediction from model output.")
                return
            }
            
            // 6. Return the predicted label to JavaScript
            val result = labels!![maxIndex]
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("CLASSIFY_ERROR", "Failed to classify image: ${e.message}")
            e.printStackTrace()
        }
    }

    @Throws(IOException::class)
    private fun loadModelFile(): ByteBuffer {
        val fileDescriptor = reactApplicationContext.assets.openFd(MODEL_FILE)
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }

    @Throws(IOException::class)
    private fun loadLabels(): List<String> {
        val labels = ArrayList<String>()
        val reader = BufferedReader(InputStreamReader(reactApplicationContext.assets.open(LABELS_FILE)))
        var line: String?
        while (reader.readLine().also { line = it } != null) {
            labels.add(line!!)
        }
        reader.close()
        return labels
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
                byteBuffer.putFloat(((value shr 8) and 0xFF) / 255.0f)  // Green
                byteBuffer.putFloat((value and 0xFF) / 255.0f)         // Blue
            }
        }
        return byteBuffer
    }
}