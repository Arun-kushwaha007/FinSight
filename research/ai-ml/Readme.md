# AI/ML Learning Materials for FinSight 🧠

This directory aggregates essential learning resources, concepts, and research notes related to the Artificial Intelligence and Machine Learning components of FinSight.

## Core ML Areas

1.  **Expense Categorization (Classification):**
    * **Models:** Naive Bayes, Support Vector Machines (SVM), or simple Neural Networks for text classification of transaction descriptions.
    * **Libraries:** `scikit-learn`, `TensorFlow`/`PyTorch` for prototyping.
    * **Data Preprocessing:** Text cleaning, tokenization, and feature engineering (e.g., using **TF-IDF** or word embeddings).

2.  **Forecasting & Prediction (Time-Series):**
    * **Models:** **ARIMA**, **Prophet** (Facebook's model), or advanced ML regression models (LSTM/GRU if complexity warrants).
    * **Goal:** Predict future expenses, income, and goal completion dates.
    * **Key Concept:** Handling seasonality (monthly/yearly cycles) and trends in financial data.

3.  **GenAI Assistant / Chatbot (NLP):**
    * **Integration:** Primarily utilizing external APIs like **OpenAI (GPT-4)** for complex Q&A and summarization.
    * **Local Focus:** Building robust **prompt engineering** to ensure accurate, secure, and personalized financial responses.
    * **Techniques:** Context window management, grounding responses in user's transaction data.

4.  **Anomaly & Fraud Detection (Unsupervised/Supervised Learning):**
    * **Goal:** Flag unusual transactions (e.g., large, out-of-pattern spending).
    * **Models:** Isolation Forest, One-Class SVM, or clustering algorithms to identify outliers.

## Implementation & Deployment

* **Python Stack:** Focus on **FastAPI** for serving ML models as scalable microservices.
* **Pipelines:** Understanding how to use **Celery** (as mentioned in the main blueprint) or similar task queues for asynchronous data processing and model inference.

---
**Next Step:** Review documentation for the **Prophet** library for initial forecasting model implementation.