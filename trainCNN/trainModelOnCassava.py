import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import ConvNeXtTiny
from tensorflow.keras.applications.convnext import preprocess_input
import pandas as pd
import numpy as np
import os
import time
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import tempfile

print("Starting ConvNeXt-Tiny training on Cassava dataset...")


# Paths

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) + "\\dataset/cassava_leaf_images"
csv_path = os.path.join(BASE_DIR, "train.csv")
image_dir = os.path.join(BASE_DIR, "train_images")


# Parameters

img_size = 224
batch_size = 32
epochs = 20
seed = 42


# Load CSV

df = pd.read_csv(csv_path)
df['label'] = df['label'].astype(str)

# Stratified split
train_df, val_df = train_test_split(
    df,
    test_size=0.2,
    stratify=df['label'],
    random_state=seed
)


# Data Generators

train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True
)

val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

train_generator = train_datagen.flow_from_dataframe(
    dataframe=train_df,
    directory=image_dir,
    x_col="image_id",
    y_col="label",
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode="categorical",
    shuffle=True,
    seed=seed
)

validation_generator = val_datagen.flow_from_dataframe(
    dataframe=val_df,
    directory=image_dir,
    x_col="image_id",
    y_col="label",
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode="categorical",
    shuffle=False
)


# Number of Classes

num_classes = len(train_generator.class_indices)

print("\nClass mapping (label → index):")
print(train_generator.class_indices)
print(f"Number of classes: {num_classes}\n")


# Build ConvNeXt-Tiny Model

base_model = ConvNeXtTiny(
    weights='imagenet',
    include_top=False,
    input_shape=(img_size, img_size, 3)
)

base_model.trainable = False  # Freeze backbone for baseline

x = base_model.output
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dense(256, activation='relu')(x)
x = layers.Dropout(0.5)(x)
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = keras.Model(inputs=base_model.input, outputs=outputs)

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=[
        'accuracy',
        tf.keras.metrics.Precision(name='precision'),
        tf.keras.metrics.Recall(name='recall')
    ]
)


# Train Model

start_train_time = time.time()

history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=epochs
)

end_train_time = time.time()
total_training_time = end_train_time - start_train_time


# Evaluation Metrics

validation_generator.reset()
predictions = model.predict(validation_generator)

y_pred = np.argmax(predictions, axis=1)
y_true = validation_generator.classes

report = classification_report(y_true, y_pred, output_dict=True)
conf_matrix = confusion_matrix(y_true, y_pred)


# Deployment Metrics


# Parameter counts
total_params = model.count_params()
trainable_params = np.sum([np.prod(v.shape) for v in model.trainable_weights])

# Model size
tmp_model_path = tempfile.mktemp(suffix=".h5")
model.save(tmp_model_path)
model_size_mb = os.path.getsize(tmp_model_path) / (1024 * 1024)
os.remove(tmp_model_path)

# CPU inference timing
sample_batch = next(validation_generator)[0][0:1]

start_inf = time.time()
for _ in range(100):
    model.predict(sample_batch, verbose=0)
end_inf = time.time()

avg_inference_time = ((end_inf - start_inf) / 100) * 1000  # ms


# Print Metrics

print("\n================= FINAL METRICS =================")

print(f"Training Time: {total_training_time:.2f} seconds")
print(f"Final Training Accuracy: {history.history['accuracy'][-1]:.4f}")
print(f"Final Validation Accuracy: {history.history['val_accuracy'][-1]:.4f}")
print(f"Final Validation Precision: {history.history['val_precision'][-1]:.4f}")
print(f"Final Validation Recall: {history.history['val_recall'][-1]:.4f}")
print(f"Macro F1-Score: {report['macro avg']['f1-score']:.4f}")

print("\nModel Parameters:")
print(f"Total Parameters: {total_params:,}")
print(f"Trainable Parameters: {trainable_params:,}")

print(f"\nModel Size: {model_size_mb:.2f} MB")
print(f"Average CPU Inference Time: {avg_inference_time:.2f} ms per image")

print("\nConfusion Matrix:")
print(conf_matrix)

print("=================================================\n")


# Save Final Model

model.save("convnext_tiny_cassava_model.h5")
print("Model saved successfully.")