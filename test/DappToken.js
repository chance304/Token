var DappToken = artifacts.require('./DappToken.sol')
contract('DappToken',(accounts)=>{
    it('sets the name and the symbol of our Token',()=>{
        return DappToken.deployed().then((instance)=>{
            tokenInstance=instance;
            return tokenInstance.name();
        }).then((name)=>{
            assert.equal(name,'DApp Token','has the correct name');
            return tokenInstance.symbol();
        }).then((symbol)=>{
            assert.equal(symbol,'DAPP','has the correct symbol');
            return tokenInstance.standard()
        }).then((standard)=>{
            assert.equal(standard,'DApp Token v1.0','has the correct standard')
        });
    });
    it('sets the total supply upon deployment',()=>{
        return DappToken.deployed().then((instance)=>{
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply)=>{
            assert.equal(totalSupply.toNumber(),1000000,'sets the toal supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then((adminBalance)=>{
            assert.equal(adminBalance.toNumber(),1000000,'allocates the initial supply to the admin');
        })
    });

    it ('transfers owenership',()=>{
        return DappToken.deployed().then((instance)=>{
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1],9999999999999);
        }).then(assert.fail).catch((err)=>{
            assert(err.message.indexOf('revert')>=0, 'error message must contain revert');
            return  tokenInstance.transfer.call(accounts[1],250000,{from:accounts[0]})
        }).then((success)=>{
            assert.equal(success,true,'found true');
            return tokenInstance.transfer(accounts[1],250000,{from:accounts[0]});
        }).then((receipt)=>{
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer','should be a transfer event');
            assert.equal(receipt.logs[0].args._from,accounts[0],'logs the account tokens are transferreed from');
            assert.equal(receipt.logs[0].args._to,accounts[1],'logs the account tokens are transferreed to');
            assert.equal(receipt.logs[0].args._value,250000,'logs the value to be transferred')
            return tokenInstance.balanceOf(accounts[1]);
        }).then((balance)=>{
            assert.equal(balance.toNumber(),250000,'adds the amount to the recieving account')
            return tokenInstance.balanceOf(accounts[0]);
        }).then((balance)=>{
            assert.equal(balance.toNumber(),750000,'deducts the amount from the sending account')
        });
    });
})