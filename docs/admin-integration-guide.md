# 어드민 프론트엔드 통합 가이드

## 개요
S3 이미지 업로드 API를 어드민 프론트엔드에 통합하기 위한 실용적인 가이드입니다.

## 빠른 시작

### 1. 인증 토큰 획득
먼저 관리자 로그인을 통해 JWT 토큰을 획득해야 합니다.

```javascript
// 로그인 API 호출
const loginResponse = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 이후 모든 API 호출에 사용
const headers = {
  'Authorization': `Bearer ${token}`
};
```

### 2. 기본 이미지 업로드 예시

#### 대표 이미지 업로드
```javascript
const uploadRepresentativeImage = async (storeId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(`/api/admin/stores/${storeId}/representative-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('업로드 성공:', result.data.imageUrl);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('업로드 실패:', error);
    throw error;
  }
};
```

#### 다중 이미지 업로드
```javascript
const uploadGalleryImages = async (storeId, imageFiles) => {
  const formData = new FormData();
  
  // 여러 파일을 같은 필드명으로 추가
  imageFiles.forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await fetch(`/api/admin/stores/${storeId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('업로드 성공:', result.data.uploadedImages);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('업로드 실패:', error);
    throw error;
  }
};
```

### 3. 이미지 삭제 예시

#### 대표 이미지 삭제
```javascript
const deleteRepresentativeImage = async (storeId) => {
  try {
    const response = await fetch(`/api/admin/stores/${storeId}/representative-image`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('삭제 성공');
      return true;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('삭제 실패:', error);
    throw error;
  }
};
```

#### 특정 갤러리 이미지 삭제
```javascript
const deleteGalleryImage = async (storeId, imageKey) => {
  // imageKey를 URL 인코딩
  const encodedImageKey = encodeURIComponent(imageKey);
  
  try {
    const response = await fetch(`/api/admin/stores/${storeId}/images/${encodedImageKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('삭제 성공');
      return true;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('삭제 실패:', error);
    throw error;
  }
};
```

## React 컴포넌트 예시

### 이미지 업로드 컴포넌트
```jsx
import React, { useState } from 'react';

const ImageUploader = ({ storeId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // 첫 번째 파일을 대표 이미지로 업로드
      const representativeFile = files[0];
      await uploadRepresentativeImage(storeId, representativeFile);

      // 나머지 파일들을 갤러리 이미지로 업로드
      if (files.length > 1) {
        const galleryFiles = Array.from(files).slice(1, 6); // 최대 5개
        await uploadGalleryImages(storeId, galleryFiles);
      }

      onUploadSuccess();
    } catch (error) {
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
  };

  return (
    <div
      className={`upload-area ${dragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      {uploading ? (
        <div>업로드 중...</div>
      ) : (
        <>
          <p>이미지를 드래그하거나 클릭하여 업로드</p>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" className="upload-button">
            파일 선택
          </label>
        </>
      )}
    </div>
  );
};
```

### 이미지 갤러리 컴포넌트
```jsx
const ImageGallery = ({ store, onImageDelete }) => {
  const handleDeleteImage = async (imageKey, isRepresentative = false) => {
    if (!confirm('이미지를 삭제하시겠습니까?')) return;

    try {
      if (isRepresentative) {
        await deleteRepresentativeImage(store._id);
      } else {
        await deleteGalleryImage(store._id, imageKey);
      }
      onImageDelete();
    } catch (error) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  return (
    <div className="image-gallery">
      {/* 대표 이미지 */}
      {store.representativeImageUrl && (
        <div className="representative-image">
          <img src={store.representativeImageUrl} alt="대표 이미지" />
          <button onClick={() => handleDeleteImage(store.representativeImage, true)}>
            삭제
          </button>
        </div>
      )}

      {/* 갤러리 이미지들 */}
      <div className="gallery-images">
        {store.imageUrls?.map((imageUrl, index) => (
          <div key={index} className="gallery-image">
            <img src={imageUrl} alt={`갤러리 이미지 ${index + 1}`} />
            <button onClick={() => handleDeleteImage(store.images[index])}>
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 에러 처리 가이드

### 파일 검증
```javascript
const validateFile = (file) => {
  // 파일 크기 검증 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
  }

  // 파일 형식 검증
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 업로드 가능합니다.');
  }

  return true;
};
```

### API 에러 처리
```javascript
const handleApiError = (error, response) => {
  if (response?.status === 401) {
    // 인증 만료 - 로그인 페이지로 리다이렉트
    window.location.href = '/login';
    return;
  }

  if (response?.status === 413) {
    return '파일 크기가 너무 큽니다.';
  }

  if (response?.status === 400) {
    return error.message || '잘못된 요청입니다.';
  }

  return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};
```

## 성능 최적화 팁

### 1. 이미지 압축 (클라이언트 사이드)
```javascript
const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};
```

### 2. 진행률 표시
```javascript
const uploadWithProgress = async (storeId, file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('업로드 실패'));
      }
    });

    xhr.open('POST', `/api/admin/stores/${storeId}/representative-image`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};
```

## 테스트 체크리스트

- [ ] 로그인 후 토큰 획득 확인
- [ ] 대표 이미지 업로드 테스트
- [ ] 다중 이미지 업로드 테스트 (최대 5개)
- [ ] 파일 크기 제한 테스트 (5MB 초과)
- [ ] 파일 형식 제한 테스트 (JPG, PNG, WebP 외)
- [ ] 이미지 삭제 테스트
- [ ] 상점 조회 시 이미지 URL 포함 확인
- [ ] 에러 처리 테스트 (네트워크 오류, 인증 오류 등)

## 문의사항
구현 중 문제가 발생하면 백엔드 개발자에게 다음 정보와 함께 문의해주세요:
- 사용한 API 엔드포인트
- 요청 헤더 및 바디
- 응답 상태 코드 및 메시지
- 브라우저 콘솔 에러 메시지