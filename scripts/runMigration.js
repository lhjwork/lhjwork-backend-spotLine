const { backupSpotLineData } = require('./backupSpotLineData');
const { migrateData } = require('./migrateFromTestToSpotLine');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runMigration() {
  try {
    console.log('🚀 Test → SpotLine 데이터 마이그레이션 프로세스 시작\n');
    
    // 사용자 확인
    console.log('⚠️  주의사항:');
    console.log('   - 이 작업은 spotLine 데이터베이스의 기존 데이터를 덮어씁니다');
    console.log('   - 마이그레이션 전에 자동으로 백업이 생성됩니다');
    console.log('   - test 데이터베이스의 데이터는 변경되지 않습니다\n');
    
    const confirm = await askQuestion('계속 진행하시겠습니까? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ 마이그레이션이 취소되었습니다.');
      rl.close();
      return;
    }
    
    console.log('\n1️⃣ 단계 1: SpotLine 데이터베이스 백업');
    await backupSpotLineData();
    
    console.log('\n2️⃣ 단계 2: Test → SpotLine 데이터 마이그레이션');
    await migrateData();
    
    console.log('\n🎉 마이그레이션 프로세스가 성공적으로 완료되었습니다!');
    console.log('\n📋 다음 단계:');
    console.log('   1. 애플리케이션을 재시작하여 새 데이터를 확인하세요');
    console.log('   2. 모든 기능이 정상 작동하는지 테스트하세요');
    console.log('   3. 문제가 있다면 scripts/backups/ 폴더의 백업 파일을 사용하여 복원하세요');
    
  } catch (error) {
    console.error('\n💥 마이그레이션 프로세스 실패:', error);
  } finally {
    rl.close();
  }
}

// 스크립트 실행
if (require.main === module) {
  runMigration()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };