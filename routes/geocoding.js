const express = require('express');
const axios = require('axios');
const router = express.Router();

// 네이버 지오코딩 API
router.get('/naver', async (req, res) => {
  try {
    const { address } = req.query;
    const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
    const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Naver API credentials not configured' });
    }

    const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode', {
      params: {
        query: address
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET
      }
    });

    const data = response.data;
    if (data.addresses && data.addresses.length > 0) {
      const { x: lng, y: lat } = data.addresses[0];
      res.json({
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        source: 'naver',
        address: data.addresses[0].roadAddress || data.addresses[0].jibunAddress
      });
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    console.error('Naver geocoding error:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// 구글 지오코딩 API
router.get('/google', async (req, res) => {
  try {
    const { address } = req.query;
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'Google API key not configured' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: GOOGLE_API_KEY,
        region: 'kr' // 한국 지역 우선
      }
    });

    const data = response.data;
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      res.json({
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        source: 'google',
        address: data.results[0].formatted_address
      });
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    console.error('Google geocoding error:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// 통합 지오코딩 API (여러 서비스 순차 시도)
router.get('/unified', async (req, res) => {
  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  // 주소 정규화 (특수문자 제거, 공백 정리)
  const normalizedAddress = address.trim().replace(/[^\w\s가-힣]/g, ' ').replace(/\s+/g, ' ');
  
  // 1차: Kakao API 시도
  try {
    const kakaoResponse = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
      params: { query: normalizedAddress },
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
      }
    });

    if (kakaoResponse.data.documents && kakaoResponse.data.documents.length > 0) {
      const { x: lng, y: lat } = kakaoResponse.data.documents[0];
      return res.json({
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        source: 'kakao',
        address: kakaoResponse.data.documents[0].address_name
      });
    }
  } catch (error) {
    console.log('Kakao geocoding failed, trying Naver...');
  }

  // 2차: Naver API 시도
  if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
    try {
      const naverResponse = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode', {
        params: { query: normalizedAddress },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET
        }
      });

      if (naverResponse.data.addresses && naverResponse.data.addresses.length > 0) {
        const { x: lng, y: lat } = naverResponse.data.addresses[0];
        return res.json({
          coordinates: {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          },
          source: 'naver',
          address: naverResponse.data.addresses[0].roadAddress || naverResponse.data.addresses[0].jibunAddress
        });
      }
    } catch (error) {
      console.log('Naver geocoding failed, trying Google...');
    }
  }

  // 3차: Google API 시도
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const googleResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: normalizedAddress,
          key: process.env.GOOGLE_MAPS_API_KEY,
          region: 'kr'
        }
      });

      if (googleResponse.data.results && googleResponse.data.results.length > 0) {
        const { lat, lng } = googleResponse.data.results[0].geometry.location;
        return res.json({
          coordinates: {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          },
          source: 'google',
          address: googleResponse.data.results[0].formatted_address
        });
      }
    } catch (error) {
      console.log('Google geocoding failed');
    }
  }

  // 모든 API 실패
  res.status(404).json({ 
    error: 'All geocoding services failed',
    suggestions: [
      '주소를 더 구체적으로 입력해보세요',
      '도로명 주소를 사용해보세요',
      '건물명을 포함해보세요',
      '수동으로 좌표를 입력해주세요'
    ]
  });
});

// 좌표 유효성 검증 (한국 영역)
router.post('/validate', (req, res) => {
  const { lat, lng } = req.body;
  
  // 한국 영역 대략적 범위
  const KOREA_BOUNDS = {
    north: 38.6,
    south: 33.0,
    east: 131.9,
    west: 124.5
  };
  
  const isValid = lat >= KOREA_BOUNDS.south && 
                  lat <= KOREA_BOUNDS.north && 
                  lng >= KOREA_BOUNDS.west && 
                  lng <= KOREA_BOUNDS.east;
  
  res.json({
    valid: isValid,
    coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
    message: isValid ? '유효한 좌표입니다' : '한국 영역을 벗어난 좌표입니다'
  });
});

module.exports = router;