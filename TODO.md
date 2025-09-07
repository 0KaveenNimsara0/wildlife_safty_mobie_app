# Wildlife Safety App Fixes

## Issue: App shows old version with basic model when running standalone

### Root Cause:
1. Model file inconsistency - two .tflite files causing confusion
2. Caching issues with React Native bundler
3. Potential asset bundling problems

### Steps to Fix:

1. [ ] Remove unused model file (snake_classifier.tflite)
2. [ ] Verify labels.txt matches snake_model.tflite output
3. [ ] Add debug logging to ImageClassifierModule
4. [ ] Clear React Native cache and rebuild
5. [ ] Test both development and production builds

### Files to Modify:
- android/app/src/main/java/com/wildlifesafety/ImageClassifierModule.kt
- android/app/src/main/assets/ (remove snake_classifier.tflite)
- Build process cleanup

### Verification:
- [ ] App loads correct model in development
- [ ] App loads correct model in production (standalone)
- [ ] Only snake species are identified (6 classes)
- [ ] No caching issues between runs
